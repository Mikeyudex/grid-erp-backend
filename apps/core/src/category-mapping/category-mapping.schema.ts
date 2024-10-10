// movement.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type CategoryMappingDocument = CategoryMapping & Document;

@Schema()
export class CategoryMapping {

    @Prop({ required: true, type: String, ref: 'Company', refPath: 'uuid'}) //Id de la compañía
    companyId: string;

    @Prop({ type: Types.ObjectId, ref: 'ProductCategory', required: true })
    internalCategoryId: Types.ObjectId;

    @Prop({ type: String, required: true })
    woocommerceCategoryId: string;

    @Prop({ type: String, required: false })
    meliCategoryId: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: string;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const CategoryMappingSchema = SchemaFactory.createForClass(CategoryMapping);
