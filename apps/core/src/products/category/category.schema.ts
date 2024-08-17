import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getCurrentUTCDate } from '../../../utils/getUtcDate';

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

@Schema({ collection: 'product-category' })
export class ProductCategory {
    @Prop({required:true, type:String, unique:true})
    uuid: string;

    @Prop({required: true })
    companyId: string;

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
export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);