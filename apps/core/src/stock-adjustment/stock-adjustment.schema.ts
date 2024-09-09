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
    
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: string;

    @Prop({ type: String, enum: TypeAdjustment, required: true })
    adjustmentType: string;

    @Prop({ type: Number, required: true })
    totalAdjustedPrice: number;

    @Prop({ type: Number, required: true })
    quantity: number;

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