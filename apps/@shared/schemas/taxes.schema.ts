import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from '../../core/utils/getUtcDate';
import { Document } from 'mongoose';

export type TaxDocument = Tax & Document;

@Schema()
export class Tax {

    @Prop({ required: true })
    companyId: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    percentage: number;

    @Prop()
    description?: string;

    @Prop({ required: true })
    shortCode: string;

    @Prop({ default: true })
    active?: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const TaxSchema = SchemaFactory.createForClass(Tax);
