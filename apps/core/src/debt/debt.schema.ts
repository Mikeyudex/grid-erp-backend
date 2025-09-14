import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';
import { DebtStatusEnum } from './debt.enum';

export type DebtDocument = Debt & Document;

export interface IDebt {
    _id: Types.ObjectId | string;
    customerId: Types.ObjectId;
    purchaseOrderId: Types.ObjectId;
    description: string;
    amountPayable: number;
    status: 'abierto' | 'cerrado';
    isInternalDebt?: boolean;
    dueDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

@Schema()
export class Debt {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Customer' })
    customerId: Types.ObjectId;

    @Prop({ required: false, type: Types.ObjectId, ref: 'Customer' })
    providerId?: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'PurchaseOrder' })
    purchaseOrderId: Types.ObjectId;

    @Prop({ required: false, type: String })
    description: string;

    @Prop({ required: true, type: Number })
    amountPayable: number;

    @Prop({ required: true, type: String, default: DebtStatusEnum.ABIERTO })
    status: 'abierto' | 'cerrado';

    @Prop({ required: false, type: Boolean, default: false })
    isInternalDebt?: boolean;

    @Prop({ required: true, type: Date, default: () => getCurrentUTCDate() })
    dueDate: Date;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);