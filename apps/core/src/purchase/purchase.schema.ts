import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';
import { Customer } from '../customers/customers.schema';
import { PurchaseDetail } from './purchase-detail.schema';
import { Income } from '../accounting/schemas/income.schema';

export type PurchaseDocument = Purchase & Document;

export interface IPurchase {
    _id: Types.ObjectId | string;
    orderNumber: number;
    providerId: Types.ObjectId | string;
    itemsQuantity: number;
    totalOrder: number;
    supplierInvoiceNumber: string;
    detail: PurchaseDetail[];
    observations?: string;
    methodOfPayment: Types.ObjectId[];
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt?: Date | null;
}

@Schema()
export class Purchase {
    @Prop({ unique: true })
    orderNumber: number;

    @Prop({ type: Types.ObjectId, ref: Customer.name, required: true })
    providerId: Types.ObjectId;

    @Prop({ required: true })// Total de productos en la compra
    itemsQuantity: number;

    @Prop({ required: true }) //Precio total de la compra
    totalOrder: number;

    @Prop({ required: false, default: null })// numero de factura del proveedor
    supplierInvoiceNumber: string;

    @Prop({ type: [PurchaseDetail], required: true })
    detail: PurchaseDetail[];

    @Prop({ required: false, default: "", type: String }) //Observaciones de la compra
    observations?: string;

    @Prop({ required: true, type: Array<Types.ObjectId>, ref: Income.name, default: [] })
    methodOfPayment: Types.ObjectId[];

    @Prop({ required: false, ref: Customer.name, type: Types.ObjectId }) //Id del usuario que crea la compra
    createdBy: Types.ObjectId;

    @Prop({ required: false, ref: Customer.name, type: Types.ObjectId }) //Id del usuario que actualiza la compra
    updatedBy: Types.ObjectId;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ required: false, default: null })
    updatedAt: Date;
}


export const PurchaseSchema = SchemaFactory.createForClass(Purchase);


PurchaseSchema.pre<PurchaseDocument>('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const counterModel = this.db.model('Counter');
        const counter = await counterModel.findOneAndUpdate(
            { entity: 'purchase' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.orderNumber = counter.seq;
    }
    next();
});