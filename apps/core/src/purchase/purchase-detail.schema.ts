
import { Prop, Schema } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';
import { Tax } from '../taxes/taxes.schema';
import { Retention } from '../retention/retention.schema';
import { User } from '../users/users.schema';
import { Product } from '../products/product.schema';

export type PurchaseDetailDocument = PurchaseDetail & Document;

@Schema()
export class PurchaseDetail {

    @Prop({ required: true, type: Types.ObjectId, ref: Product.name }) // id del producto
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Tax.name, required: true })
    taxId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Retention.name, required: true })
    retentionId: Types.ObjectId;

    @Prop({ required: true })//Precio unitario del producto
    itemPrice: number;

    //Cantidad de producto seleccionado
    @Prop({ required: true, min: 1 })
    itemQuantity: number;

    @Prop({ required: true, min: 1 })
    itemTotal: number;

    @Prop({ required: false, default: 0 })
    discountPercentage?: number;

    @Prop({ required: false, default: "", type: String })
    description?: string;

    @Prop({ required: false, ref: User.name, type: Types.ObjectId })
    createdBy?: Types.ObjectId;

    @Prop({ required: false, ref: User.name, type: Types.ObjectId })
    updatedBy?: Types.ObjectId;

    @Prop({ required: false, default: () => getCurrentUTCDate() })
    createdAt?: Date;

    @Prop({ required: false, default: null })
    updatedAt?: Date;
}