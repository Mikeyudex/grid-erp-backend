// movement.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type WoocommerceDocument = Woocommerce & Document;

@Schema()
export class Woocommerce {

    @Prop({ required: true, type: String, ref: 'Company', refPath: 'uuid' }) //Id de la compañía
    companyId: string;

    @Prop({ type: String })
    wooCommerceUrl: string;

    @Prop({ type: String })
    wooCommerceConsumerKey: string;

    @Prop({ type: String })
    wooCommerceConsumerSecret: string;

    @Prop({type: Boolean, default: true })
    isActive: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const WoocommerceSchema = SchemaFactory.createForClass(Woocommerce);
