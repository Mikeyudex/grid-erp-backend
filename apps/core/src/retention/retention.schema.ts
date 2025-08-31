import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type RetentionDocument = Retention & Document;

@Schema()
export class Retention {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Company' })
    companyId: Types.ObjectId;

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

export const RetentionSchema = SchemaFactory.createForClass(Retention);
