import { HydratedDocument } from 'mongoose';
export type ProductSubCategoryDocument = HydratedDocument<ProductSubCategory>;
export declare class ProductSubCategory {
    uuid: string;
    companyId: string;
    categoryId: string;
    name: string;
    description: string;
    shortCode: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProductSubCategorySchema: import("mongoose").Schema<ProductSubCategory, import("mongoose").Model<ProductSubCategory, any, any, any, import("mongoose").Document<unknown, any, ProductSubCategory> & ProductSubCategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductSubCategory, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ProductSubCategory>> & import("mongoose").FlatRecord<ProductSubCategory> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
