import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import mongoose, { Document, Types } from 'mongoose';

export type AccountGroupToDocument = AccountGroup & Document;

export interface IAccountGroup {
    name: string;
    code: number;
}

@Schema()
export class AccountGroup {

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'AccountClass' })
    accountClassId: Types.ObjectId;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: Number })
    code: number;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const AccountGroupSchema = SchemaFactory.createForClass(AccountGroup);