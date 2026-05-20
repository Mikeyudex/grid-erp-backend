import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';

export type CityDocument = City & Document;

@Schema()
export class City {
  @Prop({ required: true })
  name: string;

  @Prop()
  toponymName: string;

  @Prop()
  adminName1: string;

  @Prop({ default: () => getCurrentUTCDate() })
  createdAt: Date;

  @Prop({ default: null })
  updatedAt: Date;
}

export const CitySchema = SchemaFactory.createForClass(City);
