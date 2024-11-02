import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getCurrentUTCDate } from '../../core/utils/getUtcDate';

export type ProductSubCategoryDocument = HydratedDocument<ProductSubCategory>;

@Schema({ collection: 'product-subcategory' })
export class ProductSubCategory {
    @Prop({required:true, type:String, unique:true})
    uuid: string;

    @Prop({required: true })
    companyId: string;

    @Prop({required: true })
    categoryId: string;

    @Prop({required: true })
    name: string;

    @Prop({required: false })
    description: string;

    @Prop({required: false })
    shortCode: string;

    @Prop({ type: Boolean, default: true })
    active: boolean;

    @Prop({ default: () => getCurrentUTCDate()})
    createdAt: Date;

    @Prop({ default: null})
    updatedAt: Date;
}
export const ProductSubCategorySchema = SchemaFactory.createForClass(ProductSubCategory);