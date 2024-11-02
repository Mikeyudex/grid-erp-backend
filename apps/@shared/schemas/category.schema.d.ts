import { HydratedDocument } from 'mongoose';
export type ProductCategoryDocument = HydratedDocument<ProductCategory>;
export declare class ProductCategory {
    uuid: string;
    companyId: string;
    name: string;
    description: string;
    shortCode: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProductCategorySchema: import("mongoose").Schema<ProductCategory, import("mongoose").Model<ProductCategory, any, any, any, import("mongoose").Document<unknown, any, ProductCategory> & ProductCategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductCategory, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ProductCategory>> & import("mongoose").FlatRecord<ProductCategory> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
