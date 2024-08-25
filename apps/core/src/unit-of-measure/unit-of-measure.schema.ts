import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

export type UnitOfMeasureDocument = UnitOfMeasure & Document;

@Schema()
export class UnitOfMeasure {
  @Prop({ required: true })
  name: string;

  @Prop()
  abbreviation: string;  // Ejemplo: kg, lb, m, etc.

  @Prop()
  description?: string;

  @Prop({ default: () => getCurrentUTCDate() })
  createdAt: Date;

  @Prop({ default: null })
  updatedAt: Date;
}

export const UnitOfMeasureSchema = SchemaFactory.createForClass(UnitOfMeasure);
