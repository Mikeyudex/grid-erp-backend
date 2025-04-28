// counter.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type ZoneDocument = Zone & Document;

@Schema()
export class Zone {
    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: false, type: String })
    shortCode: string;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ required: false })
    updatedAt: Date;
}

export const ZoneSchema = SchemaFactory.createForClass(Zone);
