import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import mongoose, { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

export interface IAccount {
    name: string;
    typeAccount: string;
    bankAccount: string;
    numberAccount: string;
    isActive: boolean;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

@Schema()
export class Account {

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: String })
    typeAccount: string;

    @Prop({ required: true, type: String })
    bankAccount: string;
    
    @Prop({ required: true, type: String })
    numberAccount: string;

    @Prop({ required: true, type: Boolean })
    isActive: boolean;

    @Prop({ required: false, type: String })
    description: string;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);