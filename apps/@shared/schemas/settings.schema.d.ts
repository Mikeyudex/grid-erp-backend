import mongoose, { HydratedDocument } from 'mongoose';
export type SettingsDocument = HydratedDocument<Settings>;
export declare class Settings {
    uuid: string;
    companyId: string;
    name: string;
    value: Record<string, any>[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const SettingsSchema: mongoose.Schema<Settings, mongoose.Model<Settings, any, any, any, mongoose.Document<unknown, any, Settings> & Settings & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Settings, mongoose.Document<unknown, {}, mongoose.FlatRecord<Settings>> & mongoose.FlatRecord<Settings> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
