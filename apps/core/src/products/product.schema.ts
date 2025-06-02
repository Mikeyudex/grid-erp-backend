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

    @Prop({ required: false, type: String }) //Id de la bodega
    warehouseId?: string;

    @Prop({ required: false }) //Id del proveedor
    providerId?: string;

    @Prop() //id de historial de actividad por ejemplo quien lo creó, lo actualizo, etc
    historyActivityUserId: string;

    @Prop()
    name: string;

    @Prop({ required: false })
    description?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TypeProduct', required: true })
    id_type_product: string;

    @Prop()
    sku: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UnitOfMeasure', required: false })
    unitOfMeasureId: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', required: false })
    taxId: Types.ObjectId;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' })
    id_category: Types.ObjectId;

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'ProductSubCategory' })
    id_sub_category: Types.ObjectId;

    @Prop({ required: true })
    salePrice: number;

    @Prop({ required: true })
    costPrice: number;

    @Prop({ required: false, type: String })
    observations?: string;

    @Prop({ required: false, type: String })
    barCode?: string;

    @Prop({ required: false, type: Boolean, default: false })
    taxIncluded?: boolean;

    @Prop({ required: false, type: Number, default: 0 })
    taxPercent?: number;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ type: Map, of: mongoose.Schema.Types.Mixed })
    attributes: Record<string, any>;

    @Prop({ type: Map, of: mongoose.Schema.Types.Mixed })
    additionalConfigs: Record<string, any>;

    @Prop({
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TypeOfPiece'
        }],
        default: []
    })
    typeOfPieces: Types.ObjectId[];

    // Objeto de sincronización multi-marketplace
    @Prop({
        type: {
            woocommerce: {
                synced: { type: Boolean, default: false },
                productId: { type: String, default: null },
                lastSyncedAt: { type: Date, default: null },
            },
            meli: {
                synced: { type: Boolean, default: false },
                productId: { type: String, default: null },
                lastSyncedAt: { type: Date, default: null },
            },
        },
        default: {}
    })
    syncInfo: {
        woocommerce?: {
            synced: boolean;
            productId: string;
            lastSyncedAt: Date;
        },
        meli?: {
            synced: boolean;
            productId: string;
            lastSyncedAt: Date;
        }
    };
}
export const ProductSchema = SchemaFactory.createForClass(Product);