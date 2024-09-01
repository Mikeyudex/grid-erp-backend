import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop({ required: true, type: String })
    companyId: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: false, default: '' })
    otp: string;

    @Prop({ required: false, default: '' })
    secret: string;

    @Prop({ required: true })
    role: string;

    @Prop({ required: true, default: true })
    active: boolean;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);