import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type TypeOfExpenseDocument = TypeOfExpense & Document;

export interface ITypeOfExpense {
    name: string;
    code: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

@Schema()
export class TypeOfExpense {
    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: String })
    code: string;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const TypeOfExpenseSchema = SchemaFactory.createForClass(TypeOfExpense);