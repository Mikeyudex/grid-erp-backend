import { Document } from 'mongoose';
export type TaxDocument = Tax & Document;
export declare class Tax {
    companyId: string;
    name: string;
    percentage: number;
    description?: string;
    shortCode: string;
    active?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TaxSchema: import("mongoose").Schema<Tax, import("mongoose").Model<Tax, any, any, any, Document<unknown, any, Tax> & Tax & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tax, Document<unknown, {}, import("mongoose").FlatRecord<Tax>> & import("mongoose").FlatRecord<Tax> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
