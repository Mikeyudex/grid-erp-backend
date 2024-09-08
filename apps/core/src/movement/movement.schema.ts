// movement.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type MovementDocument = Movement & Document;

@Schema({ timestamps: true })
export class Movement {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: string;

    @Prop({ type: String, enum: ['entry', 'exit', 'adjustment'], required: true })
    type: string;

    @Prop({ type: Number, required: true })
    quantity: number;

    @Prop({ type: String })
    reason: string;

    @Prop({ type: Types.ObjectId, ref: 'User' }) // Para saber quién hizo el movimiento
    createdBy: string;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const MovementSchema = SchemaFactory.createForClass(Movement);
