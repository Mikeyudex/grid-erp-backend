import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

export type TypeCustomerDocument = TypeCustomer & Document;

@Schema()
export class TypeCustomer {

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    shortCode: string;

    @Prop({ default: true })
    active?: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const TypeCustomerSchema = SchemaFactory.createForClass(TypeCustomer);