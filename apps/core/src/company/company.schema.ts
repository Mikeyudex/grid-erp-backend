import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getCurrentUTCDate } from '../../utils/getUtcDate';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ collection: 'company' })
export class Company {
    @Prop({required:true, type:String, unique:true})
    uuid: string;

    @Prop({required: true })
    companyCode: string;

    @Prop({required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: Boolean, default: false })
    active: boolean;

    @Prop({ default: () => getCurrentUTCDate()})
    createdAt: Date;

    @Prop({ default: null})
    updatedAt: Date;
}
export const CompanySchema = SchemaFactory.createForClass(Company);