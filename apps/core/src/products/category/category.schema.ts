import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { getCurrentUTCDate } from '../../../utils/getUtcDate';

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

@Schema({ collection: 'product-category' })
export class ProductCategory {
    @Prop({required:true, type:String, unique:true})
    uuid: string;

    @Prop({required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Company'})
    companyId: string | Types.ObjectId;

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
export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);