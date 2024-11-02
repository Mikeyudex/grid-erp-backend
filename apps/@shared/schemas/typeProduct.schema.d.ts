import { HydratedDocument } from 'mongoose';
export type TypeProductDocument = HydratedDocument<TypeProduct>;
export declare class TypeProduct {
    name: string;
    description: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TypeProductSchema: import("mongoose").Schema<TypeProduct, import("mongoose").Model<TypeProduct, any, any, any, import("mongoose").Document<unknown, any, TypeProduct> & TypeProduct & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TypeProduct, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<TypeProduct>> & import("mongoose").FlatRecord<TypeProduct> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
