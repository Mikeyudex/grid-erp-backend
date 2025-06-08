import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import mongoose, { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

export interface IAccount {
    name: string;
    code: number;
}

@Schema()
export class Account {

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'AccountGroup' })
    accountGroupId: Types.ObjectId;

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

export const AccountSchema = SchemaFactory.createForClass(Account);