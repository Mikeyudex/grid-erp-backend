import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

export type TypeOfCustomerDocument = TypeOfCustomer & Document;

@Schema()
export class TypeOfCustomer {

    @Prop({ required: true })
    name: string;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const TypeOfCustomerSchema = SchemaFactory.createForClass(TypeOfCustomer);