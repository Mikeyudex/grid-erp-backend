import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type PurchaseOrderDocument = PurchaseOrder & Document;

@Schema({ _id: false })
export class PurchaseOrderItem {
    @Prop({ required: true, type: String })//tipo de tapete
    matType: string;

    @Prop({ required: true, type: String })//tipo de material
    materialType: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Product' }) // id del producto
    productId: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    pieces: number;

    @Prop({ required: true, type: Array<String> }) // Array de nombres de las piezas
    piecesNames: string[];

    @Prop({ required: true })//Precio unitario del producto ajustado por el precio del material
    priceItem: number;

    //Cantidad de producto seleccionado
    @Prop({ required: true, min: 1 })
    quantityItem: number;

    @Prop({ required: true })
    totalItem: number;

    @Prop({ required: false, default: "", type: String }) //Observaciones del producto
    observations: string;
}


@Schema()
export class PurchaseOrder {

    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
    clientId: Types.ObjectId;

    @Prop({ required: true })// Total de productos en la orden
    itemsQuantity: number;

    @Prop({ required: true }) //Precio total de la orden
    totalOrder: number;

    @Prop({ required: false, default: 0 })
    tax: number;

    @Prop({ required: false, default: 0 })
    discount: number;

    @Prop({ enum: ['pendiente', 'procesado', 'cancelado'], default: 'pendiente' })
    status: string;

    @Prop({ type: [PurchaseOrderItem], required: true })
    details: PurchaseOrderItem[];

    @Prop({ required: true, ref: 'User', type: Types.ObjectId }) //Id del usuario que crea la orden
    createdBy: Types.ObjectId;

    @Prop({ required: false, ref: 'User', type: Types.ObjectId }) //Id del usuario que actualiza la orden
    updatedBy: Types.ObjectId;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ required: false, default: null })
    updatedAt: Date;
}


export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);