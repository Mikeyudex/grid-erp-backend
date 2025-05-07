import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { getCurrentUTCDate } from '../../core/utils/getUtcDate';

export type ProductSubCategoryDocument = HydratedDocument<ProductSubCategory>;

@Schema({ collection: 'product-subcategory' })
export class ProductSubCategory {
    @Prop({ required: true, type: String, unique: true })
    uuid: string;

    @Prop({ required: true })
    companyId: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' })
    categoryId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    description: string;

    @Prop({ required: false })
    shortCode: string;

    @Prop({ type: Boolean, default: true })
    active: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}
export const ProductSubCategorySchema = SchemaFactory.createForClass(ProductSubCategory);