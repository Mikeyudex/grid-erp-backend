import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import mongoose, { Document, Types } from 'mongoose';

export type SubAccountDocument = SubAccount & Document;

export interface ISubAccount {
    accountId: Types.ObjectId;
    subAccountCategoryId: Types.ObjectId;
    name: string;
    code: number;
    active: boolean;
    taxDifference: boolean;
}
@Schema()
export class SubAccount {

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Account' })
    accountId: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'SubAccountCategory' })
    subAccountCategoryId: Types.ObjectId;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: Number })
    code: number;

    @Prop({ required: true, type: Boolean, default: true })
    active: boolean;

    @Prop({ required: true, type: Boolean, default: false })
    //Tax difference account or IFRS adjustments
    taxDifference: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const SubAccountSchema = SchemaFactory.createForClass(SubAccount);