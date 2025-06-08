import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

export type AccountClassDocument = AccountClass & Document;

export interface IAccountClass {
    name: string;
    code: number;
}

@Schema()
export class AccountClass {

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

export const AccountClassSchema = SchemaFactory.createForClass(AccountClass);