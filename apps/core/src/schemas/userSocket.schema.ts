import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UserSocketDocument = UserSocket & Document;

@Schema()
export class UserSocket {
  @Prop({ required: true })
  socketId: string;

  @Prop({ required: true, default: 'offline' })
  status: 'online' | 'offline';

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}

export const UserSocketSchema = SchemaFactory.createForClass(UserSocket);
