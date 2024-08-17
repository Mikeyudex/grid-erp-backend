import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getCurrentUTCDate } from '../../utils/getUtcDate';

export type AttributeConfigDocument = HydratedDocument<AttributeConfig>;

@Schema({ collection: 'attributes-config-product' })
export class AttributeConfig {
    @Prop({required:true, type:String, unique:true})
    uuid: string;

    @Prop({required:true, type:String}) //Id de la empresa
    companyId: string;

    @Prop({required: true })
    name: string;

    @Prop({required: true })
    label: string;

    @Prop()
    description: string;

    @Prop()
    type: string;

    @Prop({required:false, type:[String]})
    options: string[];

    @Prop({ type: Boolean, default: false })
    required: boolean;

    @Prop({ default: () => getCurrentUTCDate()})
    createdAt: Date;

    @Prop({ default: null})
    updatedAt: Date;
}
export const AttributeConfigSchema = SchemaFactory.createForClass(AttributeConfig);