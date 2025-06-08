import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

export type PaymentMethodDocument = PaymentMethod & Document;

export interface IPaymentMethod {
    description: string;
    code: number;
}

@Schema()
export class PaymentMethod {

    @Prop({ required: true, type: String })
    description: string;

    @Prop({ required: true, type: Number })
    code: number;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);