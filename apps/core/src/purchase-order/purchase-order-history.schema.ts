// counter.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type PurchaseOrderHistoryDocument = PurchaseOrderHistory & Document;

@Schema()
export class PurchaseOrderHistory {
    @Prop({ required: false, type: String })
    action: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User', default: "66d4ed2f825f2d54204555c1" }) // id del usuario que hizo la acción
    userId: Types.ObjectId;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;
}

export const PurchaseOrderHistorySchema = SchemaFactory.createForClass(PurchaseOrderHistory);
