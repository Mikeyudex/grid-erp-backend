import { Document } from 'mongoose';
export type UnitOfMeasureDocument = UnitOfMeasure & Document;
export declare class UnitOfMeasure {
    name: string;
    abbreviation: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UnitOfMeasureSchema: import("mongoose").Schema<UnitOfMeasure, import("mongoose").Model<UnitOfMeasure, any, any, any, Document<unknown, any, UnitOfMeasure> & UnitOfMeasure & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UnitOfMeasure, Document<unknown, {}, import("mongoose").FlatRecord<UnitOfMeasure>> & import("mongoose").FlatRecord<UnitOfMeasure> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
