import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';
import { Zone } from '../../users/zone/zone.schema';
import { TypeOfExpense } from './type-of-expense.schema';
import { Account } from './account.schema';
import { Customer } from '../../customers/customers.schema';
import { Debt } from '../../debt/debt.schema';

export type ExpenseDocument = Expense & Document;

export interface IExpense {
    sequence?: number;
    paymentDate: Date;
    providerId: Types.ObjectId;
    accountId: Types.ObjectId;
    debtIds: Types.ObjectId[];
    value: number;
    observations: string;
    paymentSupport: string;
    hasCurrentAdvancePayment?: boolean;
    zoneId: Types.ObjectId;
    typeOfExpenseId: Types.ObjectId;
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

@Schema()
export class Expense {

    @Prop({ required: false, type: Number })
    sequence: number;

    @Prop({ required: true, type: Date })
    paymentDate: Date;

    @Prop({ required: true, type: Types.ObjectId, ref: Customer.name })
    providerId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: Account.name })
    accountId: Types.ObjectId;

    @Prop({ required: false, type: Array<Types.ObjectId>, ref: Debt.name, default: null })
    debtIds: Types.ObjectId[];

    @Prop({ required: true, type: Number })
    value: number;

    @Prop({ required: false, type: String })
    observations: string;

    @Prop({ required: false, type: String })
    paymentSupport: string;

    @Prop({ required: false, type: Boolean, default: true })
    hasCurrentAdvancePayment?: boolean;

    @Prop({ required: true, type: Types.ObjectId, ref: Zone.name})
    zoneId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: TypeOfExpense.name})
    typeOfExpenseId: Types.ObjectId;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.pre<ExpenseDocument>('save', async function (next) {
    if (this.isNew && !this.sequence) {
        const counterModel = this.db.model('Counter');
        const counter = await counterModel.findOneAndUpdate(
            { entity: 'expense' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.sequence = counter.seq;
    }
    next();
});