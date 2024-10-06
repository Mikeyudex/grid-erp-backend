import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { getCurrentUTCDate } from '../../utils/getUtcDate';

export type StockDocument = HydratedDocument<Stock>;

@Schema({ collection: 'stocks' })
export class Stock {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true })
    quantity: number;

    @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
    warehouseId: string;

    @Prop()
    minQuantity: number;

    @Prop()
    maxQuantity: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}
export const StockSchema = SchemaFactory.createForClass(Stock);