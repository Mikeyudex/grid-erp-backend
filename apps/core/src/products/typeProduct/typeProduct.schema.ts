import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getCurrentUTCDate } from '../../../utils/getUtcDate';

export type ProductCategoryDocument = HydratedDocument<TypeProduct>;

@Schema()
export class TypeProduct {
    @Prop({required: true })
    name: string;

    @Prop({required: false })
    description: string;

    @Prop({ type: Boolean, default: true })
    active: boolean;

    @Prop({ default: () => getCurrentUTCDate()})
    createdAt: Date;

    @Prop({ default: null})
    updatedAt: Date;
}
export const TypeProductSchema = SchemaFactory.createForClass(TypeProduct);