import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getCurrentUTCDate } from '../../utils/getUtcDate';

export type WharehouseDocument = HydratedDocument<Warehouse>;

@Schema({ collection: 'warehouse' })
export class Warehouse {
    @Prop({required:true, type:String, unique:true})
    uuid: string;

    @Prop({required:true, type:String}) //Id de la empresa
    companyId: string;

    @Prop({required: true, type:String, unique:true })
    warehouseCode: string;

    @Prop({required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: Boolean, default: true })
    active: boolean;

    @Prop({ type: String, default: "100" })
    shortCode: string;

    @Prop({ default: () => getCurrentUTCDate()})
    createdAt: Date;

    @Prop({ default: null})
    updatedAt: Date;
}
export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);