import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import mongoose, { Document, Types } from 'mongoose';

export type MethodOfPaymentDocument = MethodOfPayment & Document;

export interface IMethodOfPayment {
    relatedToId: Types.ObjectId;
    subAccountId: Types.ObjectId;
    PaymentMethodId: Types.ObjectId;
    name: string;
    code: number;
    active: boolean;
}

@Schema()
export class MethodOfPayment {

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'RelatedTo' })
    relatedToId: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'SubAccount' })
    subAccountId: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'PaymentMethod' })
    PaymentMethodId: Types.ObjectId;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: Number })
    code: number;

    @Prop({ required: true, type: Boolean, default: true })
    active: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const MethodOfPaymentSchema = SchemaFactory.createForClass(MethodOfPayment);