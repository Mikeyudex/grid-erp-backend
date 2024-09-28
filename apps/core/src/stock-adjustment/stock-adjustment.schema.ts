// stock-adjustment.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type StockAdjustmentDocument = StockAdjustment & Document;

export enum TypeAdjustment {
    I = 'increase',
    D = 'decrease'
}

@Schema()
export class StockAdjustment {
    @Prop({ type: String, required: true })
    companyId: string;

    @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true }) //Id de la bodega
    warehouseId: string;

    @Prop({
        type: [
            {
                productId: { type: Types.ObjectId, ref: 'Product', required: true },
                oldQuantity: { type: Number, required: true },
                newQuantity: { type: Number, required: true },
                adjustedQuantity: { type: Number, required: true },
                costPrice: { type: Number, required: true },
            },
        ],
        required: true,
    })
    products: Array<{
        productId: Types.ObjectId; // Relación con el producto ajustado
        oldQuantity: number;     // Cantidad anterior al ajuste
        newQuantity: number;     // Cantidad después del ajuste
        adjustedQuantity: number;// Cantidad ajustada
        costPrice: number;
    }>;

    @Prop({ type: Number, required: true })
    totalAdjustedPrice: number;

    @Prop({ type: String })
    note: string;

    @Prop({ type: Types.ObjectId, ref: 'User' }) // Para saber quién hizo el movimiento
    createdBy: string;

    @Prop({ default: () => getCurrentUTCDate() })
    adjustmentDate: Date;

    @Prop({ default: null })
    updatedAt: Date;
}



export const StockAdjustmentSchema = SchemaFactory.createForClass(StockAdjustment);