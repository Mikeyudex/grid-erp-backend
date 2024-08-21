import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { getCurrentUTCDate } from '../../utils/getUtcDate';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ collection: 'settings' })
export class Settings {
    @Prop({required:true, type:String, unique:true})
    uuid: string;

    @Prop({required:true, type:String}) //Id de la empresa
    companyId: string;

    @Prop({required: true, unique:true })
    name: string;

    @Prop({type:[mongoose.Schema.Types.Mixed], required:true})
    value: Record<string, any>[];

    @Prop({ default: () => getCurrentUTCDate()})
    createdAt: Date;

    @Prop({ default: null})
    updatedAt: Date;
}
export const SettingsSchema = SchemaFactory.createForClass(Settings);