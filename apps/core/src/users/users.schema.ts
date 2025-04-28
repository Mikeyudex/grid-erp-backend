import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';
@Schema()
export class User extends Document {
    @Prop({ required: true, type: String })
    companyId: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    lastname: string;

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

    @Prop({ required: true, default: false })
    activeOtp: boolean;

    @Prop({ required: false, ref: 'Zone', type: Types.ObjectId })
    zoneId: Types.ObjectId;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop()
    resetPasswordToken?: string;

    @Prop()
    resetPasswordExpires?: Date;

    @Prop()
    avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);