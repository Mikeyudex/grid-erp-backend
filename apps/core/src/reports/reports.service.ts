import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PurchaseOrder, PurchaseOrderDocument } from '../purchase-order/purchase-order.schema';
import { CumulativeSalesReportDto } from './interfaces/cumulative-sales-report.interface';
import { DetailedSalesReportDto } from './interfaces/detailed-sales-report';
import { ProductSalesReportParams } from './interfaces/product-sales-report-params.interface';
import { ProductSalesReportDto } from './interfaces/ProductSalesReportDto.interface';

interface GetreportsParams {
    zoneId?: string
    advisorId?: string
    startDate?: string
    endDate?: string
}


@Injectable()
export class ReportsService {

    constructor(
        @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
    ) { }

    async CumulativeSalesReport(params: GetreportsParams): Promise<CumulativeSalesReportDto[]> {
        try {
            const { zoneId, advisorId, startDate, endDate } = params;
            const filters: any = {};

            if (zoneId) filters.zoneId = new Types.ObjectId(zoneId);
            if (advisorId) filters.createdBy = new Types.ObjectId(advisorId);

            if (startDate || endDate) {
                filters.createdAt = {};
                if (startDate) filters.deliveryDate.$gte = new Date(startDate);
                if (endDate) filters.deliveryDate.$lte = new Date(endDate);
            }

            const report = await this.purchaseOrderModel.aggregate([
                { $match: filters },
                { $unwind: "$details" },
                {
                    $group: {
                        _id: {
                            zoneId: "$zoneId",
                            advisorId: "$createdBy",
                        },
                        pedidos: { $addToSet: "$_id" },
                        tapetes: { $sum: "$details.quantityItem" },
                        valorBase: { $sum: "$details.totalItem" },
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
                    $project: {
                        _id: 0,
                        sede: "$_id.zoneId",
                        asesor: "$_id.advisorId",
                        pedidos: { $size: "$pedidos" },
                        tapetes: 1,
                        valorBase: 1,
                        descuento: 1,
                        subtotal: 1,
                        iva: 1,
                        retencion: 1,
                        valorTotal: 1,
                    },
                },
                {
                    $lookup: {
                        from: "zones",
                        localField: "sede",
                        foreignField: "_id",
                        as: "sede",
                    },
                },
                { $unwind: { path: "$sede", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "asesor",
                        foreignField: "_id",
                        as: "asesor",
                    },
                },
                { $unwind: { path: "$asesor", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        sede: { $ifNull: ["$sede.name", "Sin sede"] },
                        asesor: { $ifNull: ["$asesor.name", "Sin asesor"] },
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

                //Agregar un documento final con los totales generales
                {
                    $group: {
                        _id: null,
                        detalles: { $push: "$$ROOT" },
                        totalPedidos: { $sum: "$pedidos" },
                        totalTapetes: { $sum: "$tapetes" },
                        totalValorBase: { $sum: "$valorBase" },
                        totalDescuento: { $sum: "$descuento" },
                        totalSubtotal: { $sum: "$subtotal" },
                        totalIva: { $sum: "$iva" },
                        totalRetencion: { $sum: "$retencion" },
                        totalValorTotal: { $sum: "$valorTotal" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        detalles: {
                            $concatArrays: [
                                "$detalles",
                                [
                                    {
                                        sede: "TOTAL GENERAL",
                                        asesor: "",
                                        pedidos: "$totalPedidos",
                                        tapetes: "$totalTapetes",
                                        valorBase: "$totalValorBase",
                                        descuento: "$totalDescuento",
                                        subtotal: "$totalSubtotal",
                                        iva: "$totalIva",
                                        retencion: "$totalRetencion",
                                        valorTotal: "$totalValorTotal",
                                    },
                                ],
                            ],
                        },
                    },
                },
                { $unwind: "$detalles" },
                { $replaceRoot: { newRoot: "$detalles" } },
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
            const { zoneId, advisorId, startDate, endDate } = params;
            const filters: any = {};
            if (zoneId) {
                filters.zoneId = new Types.ObjectId(zoneId);
            }
            if (advisorId) {
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
                { $unwind: "$details" },

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
                        fecha: "$deliveryDate",
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
                        numeroFactura: "$orderNumber",
                        tapetes: "$details.quantityItem",
                        valorBase: "$details.totalItem",
                        descuento: "$discount",
                        subtotal: "$totalOrder",
                        iva: "$tax",
                        retencion: { $multiply: ["$totalOrder", 0.025] }, // 2.5% ejemplo
                        valorTotal: {
                            $subtract: [
                                { $add: ["$totalOrder", "$tax"] },
                                "$discount",
                            ],
                        },
                    },
                },
                { $sort: { fecha: 1 } }, // orden por fecha ascendente

                // Totales generales
                {
                    $group: {
                        _id: null,
                        detalles: { $push: "$$ROOT" },
                        totalValorBase: { $sum: "$valorBase" },
                        totalDescuento: { $sum: "$descuento" },
                        totalSubtotal: { $sum: "$subtotal" },
                        totalIva: { $sum: "$iva" },
                        totalRetencion: { $sum: "$retencion" },
                        totalValorTotal: { $sum: "$valorTotal" },
                        totalTapetes: { $sum: "$tapetes" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        detalles: {
                            $concatArrays: [
                                "$detalles",
                                [
                                    {
                                        fecha: null,
                                        sede: "TOTAL GENERAL",
                                        asesor: "",
                                        cliente: "",
                                        nombreComercial: "",
                                        numeroFactura: "",
                                        tapetes: "$totalTapetes",
                                        valorBase: "$totalValorBase",
                                        descuento: "$totalDescuento",
                                        subtotal: "$totalSubtotal",
                                        iva: "$totalIva",
                                        retencion: "$totalRetencion",
                                        valorTotal: "$totalValorTotal",
                                    },
                                ],
                            ],
                        },
                    },
                },
                { $unwind: "$detalles" },
                { $replaceRoot: { newRoot: "$detalles" } },
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

            if (zoneId) filters.zoneId = new Types.ObjectId(zoneId);
            if (advisorId) filters.createdBy = new Types.ObjectId(advisorId);
            if (clientId) filters.clientId = new Types.ObjectId(clientId);

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

            // 🔹 Agregar TOTAL GENERAL al final
            if (report.length > 0) {
                const totalGeneral = report.reduce(
                    (acc, curr) => ({
                        sede: "TOTAL GENERAL",
                        asesor: "",
                        cliente: "",
                        producto: "",
                        tipoTapete: "",
                        material: "",
                        cantidad: acc.cantidad + (curr.cantidad || 0),
                        valorBase: acc.valorBase + (curr.valorBase || 0),
                        descuento: acc.descuento + (curr.descuento || 0),
                        subtotal: acc.subtotal + (curr.subtotal || 0),
                        iva: acc.iva + (curr.iva || 0),
                        retencion: acc.retencion + (curr.retencion || 0),
                        valorTotal: acc.valorTotal + (curr.valorTotal || 0),
                    }),
                    {
                        sede: "TOTAL GENERAL",
                        asesor: "",
                        cliente: "",
                        producto: "",
                        tipoTapete: "",
                        material: "",
                        cantidad: 0,
                        valorBase: 0,
                        descuento: 0,
                        subtotal: 0,
                        iva: 0,
                        retencion: 0,
                        valorTotal: 0,
                    },
                );

                report.push(totalGeneral);
            }

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
}
