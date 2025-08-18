import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type IncomeDocument = Income & Document;

export enum IncomeTypeOperation {
    SALES = 'ventas',
    RECEIPTS = 'recibos',
    ANTICIPO = 'anticipo',
    CREDITO = 'credito',
}

export interface IIncome {
    purchaseOrderId: Types.ObjectId | string | null;
    sequence: number;
    typeOperation: 'ventas' | 'recibos' | 'anticipo' | 'credito';
    paymentDate: Date;
    customerId?: Types.ObjectId | string | null;
    providerId?: Types.ObjectId | string | null;
    accountId: Types.ObjectId | string | null;
    debtId: Types.ObjectId | string | null;
    value: number;
    observations: string;
    paymentSupport: string;
    hasCurrentAdvancePayment?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

@Schema()
export class Income {

    @Prop({ required: false, type: Types.ObjectId, ref: 'PurchaseOrder', default: null })
    purchaseOrderId?: Types.ObjectId;

    @Prop({ required: false, type: Number })
    sequence: number;

    @Prop({ required: true, type: String })
    typeOperation: string;

    @Prop({ required: true, type: Date })
    paymentDate: Date;

    @Prop({ required: false, type: Types.ObjectId, ref: 'Customer', default: null })
    customerId?: Types.ObjectId;

    @Prop({ required: false, type: Types.ObjectId, ref: 'ProviderErp', default: null })
    providerId?: Types.ObjectId;

    @Prop({ required: false, type: Types.ObjectId, ref: 'Account', default: null })
    accountId?: Types.ObjectId;

    @Prop({ required: false, type: Types.ObjectId, ref: 'Debt', default: null })
    debtId: Types.ObjectId;

    @Prop({ required: true, type: Number })
    value: number;

    @Prop({ required: false, type: String })
    observations: string;

    @Prop({ required: false, type: String })
    paymentSupport: string;

    @Prop({ required: false, type: Boolean, default: true })
    hasCurrentAdvancePayment?: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);

IncomeSchema.pre<IncomeDocument>('save', async function (next) {
    if (this.isNew && !this.sequence) {
        const counterModel = this.db.model('Counter');
        const counter = await counterModel.findOneAndUpdate(
            { entity: 'income' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.sequence = counter.seq;
    }
    next();
});