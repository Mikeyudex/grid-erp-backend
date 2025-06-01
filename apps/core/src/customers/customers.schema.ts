import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import mongoose, { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

export interface ICustomField {
    key: string;
    value: string;
}

export interface IContactsCustomer {
    contactName: string;
    contactLastname: string;
    contactPhone: string;
    contactEmail: string;
    contactCharge: string;
}

@Schema()
export class Customer {

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'TypeCustomer' })
    typeCustomerId: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'TypeOfCustomer' })
    typeOfCustomer: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'TypeOfDocument' })
    typeOfDocument: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    lastname: string;

    @Prop({ required: false })
    commercialName?: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    documento: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    shippingName: string;

    @Prop({ required: false })
    shippingLastname: string;

    @Prop({ required: false })
    shippingPhone: string;

    @Prop({ required: false })
    shippingEmail: string;

    @Prop({ required: false })
    shippingDocumento: string;

    @Prop({ required: false })
    shippingAddress: string;

    @Prop({ required: false })
    shippingCity: string;

    @Prop({ required: false })
    shippingPostalCode: string;

    @Prop({ required: false, type: mongoose.Schema.Types.Array, default: [] })
    contacts: IContactsCustomer[];

    @Prop({ required: false, type: mongoose.Schema.Types.Array, default: [] })
    customFields: ICustomField[];

    @Prop({ required: false })
    observations: string;

    @Prop({ default: true })
    active?: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);