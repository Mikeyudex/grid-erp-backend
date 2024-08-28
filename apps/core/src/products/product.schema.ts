import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { getCurrentUTCDate } from '../../utils/getUtcDate';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ collection: 'products' })
export class Product {
    @Prop({ required: true, type: String, unique: true })
    uuid: string;

    @Prop()
    externalId: string;

    @Prop({ required: true, type: String }) //Id de la empresa
    companyId: string;

    @Prop({ required: true, type: String }) //Id de la bodega
    warehouseId: string;

    @Prop({required: true}) //Id del proveedor
    providerId: string;

    @Prop() //id de historial de actividad por ejemplo quien lo creó, lo actualizo, etc
    historyActivityUserId: string;

    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    sku: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UnitOfMeasure', required: true })
    unitOfMeasureId: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', required: true })
    taxId: Types.ObjectId;

    @Prop({required: true})
    id_category: string;

    @Prop({required: true})
    id_sub_category: string;

    @Prop({required: true})
    salePrice: number;

    @Prop({required: true})
    costPrice: number;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ type: Map, of: mongoose.Schema.Types.Mixed })
    attributes: Record<string, any>;

    @Prop({ type: Map, of: mongoose.Schema.Types.Mixed })
    additionalConfigs: Record<string, any>;
}
export const ProductSchema = SchemaFactory.createForClass(Product);