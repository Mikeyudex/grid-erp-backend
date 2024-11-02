import { HydratedDocument } from 'mongoose';
export type ProviderErpDocument = HydratedDocument<ProviderErp>;
export declare class ProviderErp {
    uuid: string;
    companyId: string;
    providerCode: string;
    name: string;
    description: string;
    shortCode: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProviderErpSchema: import("mongoose").Schema<ProviderErp, import("mongoose").Model<ProviderErp, any, any, any, import("mongoose").Document<unknown, any, ProviderErp> & ProviderErp & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProviderErp, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ProviderErp>> & import("mongoose").FlatRecord<ProviderErp> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
