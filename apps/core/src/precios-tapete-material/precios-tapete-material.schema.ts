import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

export type MatMaterialPricesDocument = MatMaterialPrices & Document;

@Schema()
export class MatMaterialPrices {

    @Prop({ required: true, type: String })
    tipo_tapete: string;

    @Prop({ required: true, type: String })
    tipo_material: string;

    @Prop({ required: true, type: Number })
    precioBase: number;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const MatMaterialPricesSchema = SchemaFactory.createForClass(MatMaterialPrices);