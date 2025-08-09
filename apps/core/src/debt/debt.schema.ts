import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type DebtDocument = Debt & Document;

export interface IDebt {
    _id: Types.ObjectId | string;
    customerId: Types.ObjectId;
    purchaseOrderId: Types.ObjectId;
    description: string;
    amountPayable: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

@Schema()
export class Debt {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Customer' })
    customerId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'PurchaseOrder' })
    purchaseOrderId: Types.ObjectId;

    @Prop({ required: false, type: String })
    description: string;

    @Prop({ required: true, type: Number })
    amountPayable: number;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);