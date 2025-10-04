import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PurchaseOrder, PurchaseOrderDocument } from '../purchase-order/purchase-order.schema';
import { CumulativeSalesReportDto } from './interfaces/cumulative-sales-report.interface';
import { DetailedSalesReportDto } from './interfaces/detailed-sales-report';

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
}
