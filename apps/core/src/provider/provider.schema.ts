import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getCurrentUTCDate } from '../../utils/getUtcDate';

export type ProviderErpDocument = HydratedDocument<ProviderErp>;

@Schema({ collection: 'providers' })
export class ProviderErp {
    @Prop({required:true, type:String, unique:true})
    uuid: string;

    @Prop({required:true, type:String}) //Id de la empresa
    companyId: string;

    @Prop({required: true, type:String, unique:true })
    providerCode: string;

    @Prop({required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: Boolean, default: true })
    active: boolean;

    @Prop({ default: () => getCurrentUTCDate()})
    createdAt: Date;

    @Prop({ default: null})
    updatedAt: Date;
}
export const ProviderErpSchema = SchemaFactory.createForClass(ProviderErp);