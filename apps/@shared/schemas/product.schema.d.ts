import mongoose, { HydratedDocument, Types } from 'mongoose';
export type ProductDocument = HydratedDocument<Product>;
export declare class Product {
    uuid: string;
    externalId: string;
    companyId: string;
    warehouseId: string;
    providerId: string;
    historyActivityUserId: string;
    name: string;
    description: string;
    id_type_product: string;
    sku: string;
    unitOfMeasureId: Types.ObjectId;
    taxId: Types.ObjectId;
    id_category: string;
    id_sub_category: string;
    salePrice: number;
    costPrice: number;
    createdAt: Date;
    updatedAt: Date;
    attributes: Record<string, any>;
    additionalConfigs: Record<string, any>;
    syncInfo: {
        woocommerce?: {
            synced: boolean;
            productId: string;
            lastSyncedAt: Date;
        };
        meli?: {
            synced: boolean;
            productId: string;
            lastSyncedAt: Date;
        };
    };
}
export declare const ProductSchema: mongoose.Schema<Product, mongoose.Model<Product, any, any, any, mongoose.Document<unknown, any, Product> & Product & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Product, mongoose.Document<unknown, {}, mongoose.FlatRecord<Product>> & mongoose.FlatRecord<Product> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
