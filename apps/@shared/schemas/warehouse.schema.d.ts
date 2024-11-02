import { HydratedDocument } from 'mongoose';
export type WharehouseDocument = HydratedDocument<Warehouse>;
export declare class Warehouse {
    uuid: string;
    companyId: string;
    warehouseCode: string;
    name: string;
    description: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WarehouseSchema: import("mongoose").Schema<Warehouse, import("mongoose").Model<Warehouse, any, any, any, import("mongoose").Document<unknown, any, Warehouse> & Warehouse & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Warehouse, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Warehouse>> & import("mongoose").FlatRecord<Warehouse> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
