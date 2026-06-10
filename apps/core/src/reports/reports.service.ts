import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { PurchaseOrder, PurchaseOrderDocument } from '../purchase-order/purchase-order.schema';
import { CumulativeSalesReportDto } from './interfaces/cumulative-sales-report.interface';
import { DetailedSalesReportDto } from './interfaces/detailed-sales-report';
import { ProductSalesReportParams } from './interfaces/product-sales-report-params.interface';
import { ProductSalesReportDto } from './interfaces/ProductSalesReportDto.interface';
import { Debt, DebtDocument } from '../debt/debt.schema';
import { AccountsReceivableParams } from './interfaces/AccountsReceivableParams.interface';
import { Account, AccountDocument } from '../accounting/schemas/account.schema';
import { Income, IncomeDocument } from '../accounting/schemas/income.schema';

interface GetreportsParams {
    zoneId?: string
    advisorId?: string
    clientId?: string
    startDate?: string
    endDate?: string
}


@Injectable()
export class ReportsService implements OnModuleInit {

    constructor(
        @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
        @InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>,
        @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
        @InjectModel(Income.name) private readonly incomeModel: Model<IncomeDocument>,
    ) { }

    async onModuleInit() {
        try {
            await this.backfillCreditIncomes();
        } catch (err) {
            console.error('Error backfilling credit incomes:', err);
        }
    }

    async backfillCreditIncomes() {
        console.log('Starting backfill for credit incomes...');
        const creditAccounts = await this.accountModel.find({
            $or: [
                { typeAccount: { $regex: /^crédito$/i } },
                { bankAccount: 'CXC' },
                { name: { $regex: /crédito/i } }
            ]
        });

        if (creditAccounts.length === 0) {
            console.log('No credit accounts found to associate backfilled incomes.');
            return;
        }

        const creditAccountId = creditAccounts[0]._id;
        console.log(`Using credit account ID: ${creditAccountId} (${creditAccounts[0].name})`);

        const debts = await this.debtModel.find({
            deletedAt: null,
            isInternalDebt: false,
            purchaseOrderId: { $ne: null }
        });

        console.log(`Found ${debts.length} active debts to check.`);

        let createdCount = 0;
        for (const debt of debts) {
            const order = await this.purchaseOrderModel.findById(debt.purchaseOrderId);
            if (!order) {
                continue;
            }

            const existingIncome = await this.incomeModel.findOne({
                purchaseOrderId: debt.purchaseOrderId,
                typeOperation: 'credito'
            });

            if (!existingIncome) {
                const newIncome = new this.incomeModel({
                    purchaseOrderId: debt.purchaseOrderId,
                    typeOperation: 'credito',
                    paymentDate: debt.dueDate || order.createdAt || new Date(),
                    customerId: debt.customerId,
                    accountId: creditAccountId,
                    value: debt.amountPayable,
                    debtIds: [debt._id],
                    observations: `Migración automática: Ingreso de crédito para Pedido #${order.orderNumber}`,
                    hasCurrentAdvancePayment: false,
                    isInternalPayment: false
                });
                await newIncome.save();

                await this.purchaseOrderModel.findByIdAndUpdate(debt.purchaseOrderId, {
                    $addToSet: { methodOfPayment: newIncome._id }
                });

                createdCount++;
            }
        }

        console.log(`Backfill completed. Created ${createdCount} missing credit incomes.`);
    }

    async CumulativeSalesReport(params: GetreportsParams): Promise<CumulativeSalesReportDto[]> {
        try {
            const { zoneId, advisorId, startDate, endDate } = params;
            const filters: any = {};

            if (zoneId && zoneId !== null && zoneId !== 'null') {
                filters.zoneId = new Types.ObjectId(zoneId)
            };
            if (advisorId && advisorId !== null && advisorId !== 'null') {
                filters.createdBy = new Types.ObjectId(advisorId)
            };

            if (startDate || endDate) {
                filters.deliveryDate = {};
                if (startDate) filters.deliveryDate.$gte = new Date(startDate);
                if (endDate) filters.deliveryDate.$lte = new Date(endDate);
            }
            const report = await this.purchaseOrderModel.aggregate([
                { $match: filters },
                {
                    $addFields: {
                        totalTapetesDoc: { $sum: "$details.quantityItem" },
                        totalBaseDoc: { $sum: "$details.totalItem" },
                    },
                },
                {
                    $group: {
                        _id: "$orderNumber",
                        sedeId: { $first: "$zoneId" },
                        asesorId: { $first: "$createdBy" },
                        clientId: { $first: "$clientId" },
                        numeroFactura: { $first: "$orderNumber" },
                        fecha: { $first: "$deliveryDate" },
                        pedidos: { $sum: 1 },
                        tapetes: { $sum: "$totalTapetesDoc" },
                        valorBase: { $sum: "$totalBaseDoc" },
                        descuento: { $sum: "$discount" },
                        subtotal: { $sum: "$totalOrder" },
                        iva: { $sum: "$tax" },
                        retencion: { $sum: { $multiply: ["$totalOrder", 0.025] } },
                        valorTotal: {
                            $sum: {
                                $subtract: [
                                    { $add: ["$totalOrder", "$tax"] },
                                    "$discount",
                                ],
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "clientId",
                        foreignField: "_id",
                        as: "client",
                    },
                },
                { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "zones",
                        localField: "sedeId",
                        foreignField: "_id",
                        as: "sede",
                    },
                },
                { $unwind: { path: "$sede", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "asesorId",
                        foreignField: "_id",
                        as: "asesor",
                    },
                },
                { $unwind: { path: "$asesor", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 0,
                        sede: { $ifNull: ["$sede.name", "Sin sede"] },
                        asesor: {
                            $ifNull: [
                                {
                                    $concat: [
                                        { $ifNull: ["$asesor.name", ""] },
                                        " ",
                                        { $ifNull: ["$asesor.lastname", ""] },
                                    ],
                                },
                                "Sin asesor",
                            ],
                        },
                        cliente: {
                            $ifNull: [
                                {
                                    $concat: [
                                        { $ifNull: ["$client.name", ""] },
                                        " ",
                                        { $ifNull: ["$client.lastname", ""] },
                                    ],
                                },
                                "Sin cliente",
                            ],
                        },
                        numeroFactura: 1,
                        fecha: 1,
                        pedidos: 1,
                        tapetes: 1,
                        valorBase: 1,
                        descuento: 1,
                        subtotal: 1,
                        iva: 1,
                        retencion: 1,
                        valorTotal: 1,
                    },
                },

            ]);

            return report;

        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async detailedSalesReport(params: GetreportsParams): Promise<DetailedSalesReportDto[]> {
        try {
            const { zoneId, advisorId, clientId, startDate, endDate } = params;
            const filters: any = {};
            if (zoneId && zoneId !== null && zoneId !== 'null' && zoneId !== 'all') {
                filters.zoneId = new Types.ObjectId(zoneId);
            }
            if (clientId && clientId !== null && clientId !== 'null' && clientId !== 'all') {
                filters.clientId = new Types.ObjectId(clientId);
            }
            if (advisorId && advisorId !== null && advisorId !== 'null' && advisorId !== 'all') {
                filters.advisorId = new Types.ObjectId(advisorId);
            }
            if (startDate || endDate) {
                filters.deliveryDate = {};
                if (startDate) {
                    filters.deliveryDate.$gte = new Date(startDate);
                }
                if (endDate) {
                    filters.deliveryDate.$lte = new Date(endDate);
                }
            }

            const report = await this.purchaseOrderModel.aggregate([
                { $match: filters },
                {
                    $addFields: {
                        totalTapetesDoc: { $sum: "$details.quantityItem" },
                        totalBaseDoc: { $sum: "$details.totalItem" },
                    },
                },
                {
                    $group: {
                        _id: "$orderNumber",
                        fecha: { $first: "$deliveryDate" },
                        zoneId: { $first: "$zoneId" },
                        createdBy: { $first: "$createdBy" },
                        clientId: { $first: "$clientId" },
                        numeroFactura: { $first: "$orderNumber" },
                        tapetes: { $sum: "$totalTapetesDoc" },
                        valorBase: { $sum: "$totalBaseDoc" },
                        descuento: { $sum: "$discount" },
                        subtotal: { $sum: "$totalOrder" },
                        iva: { $sum: "$tax" },
                        retencion: { $sum: { $multiply: ["$totalOrder", 0.025] } },
                        valorTotal: {
                            $sum: {
                                $subtract: [
                                    { $add: ["$totalOrder", "$tax"] },
                                    "$discount",
                                ],
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "zones",
                        localField: "zoneId",
                        foreignField: "_id",
                        as: "zone",
                    },
                },
                { $unwind: { path: "$zone", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "createdBy",
                        foreignField: "_id",
                        as: "advisor",
                    },
                },
                { $unwind: { path: "$advisor", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "customers",
                        localField: "clientId",
                        foreignField: "_id",
                        as: "client",
                    },
                },
                { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 0,
                        fecha: 1,
                        sede: { $ifNull: ["$zone.name", "Sin sede"] },
                        asesor: {
                            $ifNull: [
                                {
                                    $concat: [
                                        { $ifNull: ["$advisor.name", ""] },
                                        " ",
                                        { $ifNull: ["$advisor.lastname", ""] },
                                    ],
                                },
                                "Sin asesor",
                            ],
                        },
                        cliente: {
                            $ifNull: [
                                {
                                    $concat: [
                                        { $ifNull: ["$client.name", ""] },
                                        " ",
                                        { $ifNull: ["$client.lastname", ""] },
                                    ],
                                },
                                "Sin cliente",
                            ],
                        },
                        nombreComercial: { $ifNull: ["$client.commercialName", ""] },
                        numeroFactura: 1,
                        tapetes: 1,
                        valorBase: 1,
                        descuento: 1,
                        subtotal: 1,
                        iva: 1,
                        retencion: 1,
                        valorTotal: 1,
                    },
                },
                { $sort: { fecha: 1 } },
            ]);
            //Limpieza de espacios extra en nombres
            return report.map((r) => ({
                ...r,
                asesor: r.asesor?.trim() || "",
                cliente: r.cliente?.trim() || "",
            }));

        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async ProductSalesReport(params: ProductSalesReportParams): Promise<ProductSalesReportDto[]> {
        try {
            const {
                zoneId,
                advisorId,
                clientId,
                productId,
                matType,
                materialType,
                startDate,
                endDate,
                global = false,
            } = params;

            const filters: any = {};

            if (zoneId && zoneId !== null && zoneId !== 'null' && zoneId !== 'all') filters.zoneId = new Types.ObjectId(zoneId);
            if (advisorId && advisorId !== null && advisorId !== 'null' && advisorId !== 'all') filters.createdBy = new Types.ObjectId(advisorId);
            if (clientId && clientId !== null && clientId !== 'null' && clientId !== 'all') filters.clientId = new Types.ObjectId(clientId);

            if (startDate || endDate) {
                filters.deliveryDate = {};
                if (startDate) filters.deliveryDate.$gte = new Date(startDate);
                if (endDate) filters.deliveryDate.$lte = new Date(endDate);
            }
            const pipeline: any[] = [
                { $match: filters },
                { $unwind: "$details" },

                // 🔹 Filtros a nivel de detalle
                {
                    $match: {
                        ...(productId && { "details.productId": productId }),
                        ...(matType && { "details.matType": matType }),
                        ...(materialType && { "details.materialType": materialType }),
                    },
                },
                // 🔹 Relaciones
                { $lookup: { from: "zones", localField: "zoneId", foreignField: "_id", as: "zone" } },
                { $unwind: { path: "$zone", preserveNullAndEmptyArrays: true } },

                { $lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "advisor" } },
                { $unwind: { path: "$advisor", preserveNullAndEmptyArrays: true } },

                { $lookup: { from: "customers", localField: "clientId", foreignField: "_id", as: "client" } },
                { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },

                { $lookup: { from: "products", localField: "details.productId", foreignField: "_id", as: "product" } },
                { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

                // 🔹 Nuevo lookup a matmaterialprices
                {
                    $lookup: {
                        from: "matmaterialprices",
                        let: { tipo: "$details.matType", material: "$details.materialType" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$tipo_tapete", "$$tipo"] },
                                            { $eq: ["$tipo_material", "$$material"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "matMaterialInfo",
                    },
                },
                { $unwind: { path: "$matMaterialInfo", preserveNullAndEmptyArrays: true } },

                // 🔹 Proyección
                {
                    $project: {
                        sede: { $ifNull: ["$zone.name", "Sin sede"] },
                        asesor: {
                            $concat: [
                                { $ifNull: ["$advisor.name", ""] },
                                " ",
                                { $ifNull: ["$advisor.lastname", ""] },
                            ],
                        },
                        cliente: {
                            $concat: [
                                { $ifNull: ["$client.name", ""] },
                                " ",
                                { $ifNull: ["$client.lastname", ""] },
                            ],
                        },
                        producto: { $ifNull: ["$product.name", "Sin producto"] },
                        tipoTapete: { $ifNull: ["$matMaterialInfo.tipo_tapete", "$details.matType"] },
                        material: { $ifNull: ["$matMaterialInfo.tipo_material", "$details.materialType"] },
                        cantidad: "$details.quantityItem",
                        valorBase: "$details.totalItem",
                        descuento: "$discount",
                        subtotal: "$totalOrder",
                        iva: "$tax",
                        retencion: { $multiply: ["$totalOrder", 0.025] },
                        valorTotal: {
                            $subtract: [
                                { $add: ["$totalOrder", "$tax"] },
                                "$discount",
                            ],
                        },
                    },
                },
            ];

            // 🔹 Agrupación según modo (global o detallado)
            if (global) {
                pipeline.push({
                    $group: {
                        _id: {
                            sede: "$sede",
                            asesor: "$asesor",
                            cliente: "$cliente",
                            producto: "$producto",
                            tipoTapete: "$tipoTapete",
                            material: "$material",
                        },
                        cantidad: { $sum: "$cantidad" },
                        valorBase: { $sum: "$valorBase" },
                        descuento: { $sum: "$descuento" },
                        subtotal: { $sum: "$subtotal" },
                        iva: { $sum: "$iva" },
                        retencion: { $sum: "$retencion" },
                        valorTotal: { $sum: "$valorTotal" },
                    },
                });
                pipeline.push({
                    $project: {
                        _id: 0,
                        sede: "$_id.sede",
                        asesor: "$_id.asesor",
                        cliente: "$_id.cliente",
                        producto: "$_id.producto",
                        tipoTapete: "$_id.tipoTapete",
                        material: "$_id.material",
                        cantidad: 1,
                        valorBase: 1,
                        descuento: 1,
                        subtotal: 1,
                        iva: 1,
                        retencion: 1,
                        valorTotal: 1,
                    },
                });
            }

            const report = await this.purchaseOrderModel.aggregate(pipeline);

            // 🔹 Limpieza de espacios extra
            return report.map((r) => ({
                ...r,
                asesor: r.asesor?.trim() || "",
                cliente: r.cliente?.trim() || "",
            }));
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: "Error generando el reporte de ventas por producto",
                error: error.message || "Unknown error",
            });
        }
    }

    async AccountsReceivableReport(params: AccountsReceivableParams) {
        try {
            const { clientId, zoneId, advisorId, mode = 'global' } = params;

            const match: any = {
                status: 'abierto',
                isInternalDebt: false
            };

            if (clientId && clientId !== null && clientId !== 'null') match.customerId = new Types.ObjectId(clientId);


            const pipeline: PipelineStage[] = [
                { $match: match },
                // 🔗 Join con PurchaseOrders
                {
                    $lookup: {
                        from: 'purchaseorders',
                        localField: 'purchaseOrderId',
                        foreignField: '_id',
                        as: 'purchaseOrder'
                    }
                },
                { $unwind: { path: '$purchaseOrder', preserveNullAndEmptyArrays: true } },

                // 🔗 Join con Clientes
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

                // 🔗 Join con Asesores
                {
                    $lookup: {
                        from: 'users',
                        localField: 'purchaseOrder.createdBy',
                        foreignField: '_id',
                        as: 'advisor'
                    }
                },
                { $unwind: { path: '$advisor', preserveNullAndEmptyArrays: true } },

                // 🔗 Join con Zonas (Sedes)
                {
                    $lookup: {
                        from: 'zones',
                        let: { zoneId: '$purchaseOrder.zoneId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$zoneId'] }
                                }
                            }
                        ],
                        as: 'zone'
                    }
                },
                { $unwind: { path: '$zone', preserveNullAndEmptyArrays: true } },

                // 🧮 Calcular días de mora
                {
                    $addFields: {
                        diasMora: {
                            $dateDiff: {
                                startDate: '$dueDate',
                                endDate: '$$NOW',
                                unit: 'day'
                            }
                        }
                    }
                },

                // 🎨 Clasificar color según días de mora
                {
                    $addFields: {
                        colorMora: {
                            $switch: {
                                branches: [
                                    { case: { $lt: ['$diasMora', 0] }, then: 'verde' },
                                    {
                                        case: {
                                            $and: [{ $gte: ['$diasMora', 0] }, { $lte: ['$diasMora', 30] }]
                                        },
                                        then: 'amarillo'
                                    },
                                    { case: { $gt: ['$diasMora', 30] }, then: 'rojo' }
                                ],
                                default: 'sin datos'
                            }
                        }
                    }
                }
            ] as PipelineStage[];

            // 📍 Aplicar filtros opcionales
            if (zoneId) {
                pipeline.splice(3, 0, {
                    $match: { 'purchaseOrder.zoneId': new Types.ObjectId(zoneId) }
                });
            }

            if (advisorId) {
                pipeline.splice(3, 0, {
                    $match: { 'purchaseOrder.createdBy': new Types.ObjectId(advisorId) }
                });
            }

            // 🧾 Modo GLOBAL (consolidado por cliente)
            if (mode === 'global') {
                pipeline.push(
                    {
                        $group: {
                            _id: '$customer._id',
                            cliente: {
                                $first: { $concat: ['$customer.name', ' ', '$customer.lastname'] }
                            },
                            nombreComercial: { $first: '$customer.commercialName' },
                            ciudad: { $first: '$customer.city' },
                            asesor: {
                                $first: { $concat: ['$advisor.name', ' ', '$advisor.lastname'] }
                            },
                            sede: { $first: '$zone.name' },
                            totalDeuda: { $sum: '$amountPayable' },
                            diasMora: { $max: '$diasMora' },
                            colorMora: { $first: '$colorMora' },
                            cantidadFacturas: { $sum: 1 }
                        }
                    },
                    { $sort: { cliente: 1 } }
                );
            }

            // 🧾 Modo DETALLADO (por pedido)
            if (mode === 'detallado') {
                pipeline.push(
                    {
                        $project: {
                            _id: 0,
                            cliente: { $concat: ['$customer.name', ' ', '$customer.lastname'] },
                            nombreComercial: '$customer.commercialName',
                            ciudad: '$customer.city',
                            asesor: { $concat: ['$advisor.name', ' ', '$advisor.lastname'] },
                            sede: '$zone.name',
                            nroFactura: '$purchaseOrder.orderNumber',
                            vence: '$dueDate',
                            diasMora: 1,
                            colorMora: 1,
                            valorTotal: '$amountPayable'
                        }
                    },
                    { $sort: { cliente: 1, diasMora: -1 } }
                );
            }

            const result = await this.debtModel.aggregate(pipeline);
            return result;
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: "Error generando el reporte de cuentas por cobrar consolidado",
                error: error.message,
            });
        }
    }

    async getBankAccountsBalanceReport(filters?: { typeAccount?: string; bankAccount?: string }) {
        const match: any = { isActive: true, deletedAt: null };

        if (filters?.typeAccount) match.typeAccount = filters.typeAccount;
        if (filters?.bankAccount) match.bankAccount = filters.bankAccount;

        const pipeline: any[] = [
            //Filtro base
            { $match: match },

            // 🧩 Construir nombre de cuenta
            {
                $addFields: {
                    cuenta: '$name',
                },
            },

            //Proyección principal
            {
                $project: {
                    _id: 0,
                    cuenta: 1,
                    saldo: { $ifNull: ['$balance', 0] },
                    typeAccount: 1,
                    bankAccount: 1,
                    numberAccount: 1,
                    name: 1,
                },
            },

            // 📋 Ordenar por nombre
            { $sort: { cuenta: 1 } },

            // Agrupar en un array y calcular total general
            {
                $group: {
                    _id: null,
                    cuentas: { $push: { cuenta: '$cuenta', saldo: '$saldo', typeAccount: '$typeAccount', bankAccount: '$bankAccount', numberAccount: '$numberAccount', name: '$name' } },
                    totalGeneral: { $sum: '$saldo' },
                },
            },

            //Reestructurar salida
            {
                $project: {
                    _id: 0,
                    cuentas: 1,
                    totalGeneral: 1,
                },
            },
        ];

        const result = await this.accountModel.aggregate(pipeline);

        if (result.length > 0) {
            return {
                cuentas: result[0].cuentas,
                totalGeneral: result[0].totalGeneral,
            };
        }
        return { cuentas: [], totalGeneral: 0 };
    }

    async getAccountMovementsReport(params: {
        accountId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<any[]> {
        const { accountId, startDate, endDate } = params;

        const dateFilter: any = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const matchIncome: any = { deletedAt: null, isInternalPayment: false, typeOperation: { $ne: 'credito' } };
        const matchExpense: any = { deletedAt: null };
        if (accountId) {
            matchIncome.accountId = new Types.ObjectId(accountId);
            matchExpense.accountId = new Types.ObjectId(accountId);
        }
        if (Object.keys(dateFilter).length > 0) {
            matchIncome.paymentDate = dateFilter;
            matchExpense.paymentDate = dateFilter;
        }

        // 🔹 PIPELINE DE INGRESOS
        const incomePipeline: any[] = [
            { $match: matchIncome },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'accountId',
                    foreignField: '_id',
                    as: 'account',
                },
            },
            { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer',
                },
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    cuenta: { $concat: ['$account.bankAccount', ' - ', '$account.numberAccount'] },
                    accountNumber: '$account.numberAccount',
                    bankAccount: '$account.bankAccount',
                    typeAccount: '$account.typeAccount',
                    nombreTercero: { $ifNull: ['$customer.commercialName', 'Sin cliente'] },
                    comprobante: { $concat: ['REC-', { $toString: '$sequence' }] },
                    fecha: '$paymentDate',
                    ingreso: '$value',
                    egreso: { $literal: 0 },
                    movementType: { $literal: 'Ingreso' },
                },
            },
        ];

        // 🔹 PIPELINE DE EGRESOS
        const expensePipeline: any[] = [
            { $match: matchExpense },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'accountId',
                    foreignField: '_id',
                    as: 'account',
                },
            },
            { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'providerId',
                    foreignField: '_id',
                    as: 'provider',
                },
            },
            { $unwind: { path: '$provider', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    cuenta: { $concat: ['$account.bankAccount', ' - ', '$account.numberAccount'] },
                    accountNumber: '$account.numberAccount',
                    bankAccount: '$account.bankAccount',
                    typeAccount: '$account.typeAccount',
                    nombreTercero: { $ifNull: ['$provider.commercialName', 'Sin proveedor'] },
                    comprobante: { $concat: ['EGR-', { $toString: '$sequence' }] },
                    fecha: '$paymentDate',
                    ingreso: { $literal: 0 },
                    egreso: '$value',
                    movementType: { $literal: 'Egreso' },
                },
            },
        ];

        // PIPELINE DE CREDITOS — deudas generadas por pedidos con metodo de pago tipo credito
        const matchDebt: any = { deletedAt: null, isInternalDebt: false };
        if (Object.keys(dateFilter).length > 0) {
            matchDebt.dueDate = dateFilter;
        }

        const creditAccountFilter = accountId
            ? [{ $match: { $expr: { $eq: [{ $arrayElemAt: ['$creditIncomes.accountId', 0] }, new Types.ObjectId(accountId)] } } }]
            : [];

        const creditPipeline: any[] = [
            { $match: matchDebt },
            {
                $lookup: {
                    from: 'purchaseorders',
                    localField: 'purchaseOrderId',
                    foreignField: '_id',
                    as: 'order',
                },
            },
            { $unwind: { path: '$order', preserveNullAndEmptyArrays: false } },
            {
                $lookup: {
                    from: 'incomes',
                    let: { orderId: '$order._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$purchaseOrderId', '$$orderId'] },
                                        { $eq: ['$typeOperation', 'credito'] },
                                    ],
                                },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: 'creditIncomes',
                },
            },
            { $match: { $expr: { $gt: [{ $size: '$creditIncomes' }, 0] } } },
            ...creditAccountFilter,
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer',
                },
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'accounts',
                    let: { acctId: { $arrayElemAt: ['$creditIncomes.accountId', 0] } },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$acctId'] } } },
                        { $limit: 1 },
                    ],
                    as: 'creditAccount',
                },
            },
            { $unwind: { path: '$creditAccount', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    cuenta: {
                        $concat: [
                            { $ifNull: ['$creditAccount.bankAccount', 'Credito'] },
                            ' - ',
                            { $ifNull: ['$creditAccount.numberAccount', ''] },
                        ],
                    },
                    accountNumber: { $ifNull: ['$creditAccount.numberAccount', ''] },
                    bankAccount: { $ifNull: ['$creditAccount.bankAccount', 'Credito'] },
                    typeAccount: { $ifNull: ['$creditAccount.typeAccount', 'Credito'] },
                    nombreTercero: { $ifNull: ['$customer.commercialName', 'Sin cliente'] },
                    comprobante: { $concat: ['CRE-', { $toString: '$order.orderNumber' }] },
                    fecha: '$dueDate',
                    ingreso: '$amountPayable',
                    egreso: { $literal: 0 },
                    movementType: { $literal: 'Credito' },
                },
            },
        ];

        // FUSIONAR INGRESOS, EGRESOS Y CREDITOS + CALCULAR SALDO
        const combinedPipeline: any[] = [
            { $unionWith: { coll: 'expenses', pipeline: expensePipeline } },
            { $unionWith: { coll: 'debts', pipeline: creditPipeline } },
            { $sort: { fecha: 1 } },
            {
                $setWindowFields: {
                    sortBy: { fecha: 1 },
                    output: {
                        saldo: {
                            $sum: { $subtract: ['$ingreso', '$egreso'] },
                            window: { documents: ['unbounded', 'current'] },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    cuenta: 1,
                    accountNumber: 1,
                    bankAccount: 1,
                    typeAccount: 1,
                    nombreTercero: 1,
                    comprobante: 1,
                    fecha: 1,
                    ingreso: 1,
                    egreso: 1,
                    saldo: 1,
                    movementType: 1,
                },
            },
        ];

        // 🔹 EJECUTAR PIPELINE COMPLETO
        const result = await this.incomeModel.aggregate([
            ...incomePipeline,
            ...combinedPipeline,
        ]);

        return result;
    }
}
