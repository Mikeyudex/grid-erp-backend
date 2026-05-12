import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';
import { RoleUser, RoleUserDocument } from '../role-user/role-user.schema';

export interface IUser {
    _id: string | Types.ObjectId,
    documento: string,
    email: string,
    phone: string,
    name: string,
    lastname: string,
    password: string,
    otp: string,
    secret: string,
    roleId: (string | Types.ObjectId)[],
    active: boolean,
    activeOtp: boolean,
    skipOtp?: boolean,
    createdAt: Date,
    updatedAt: Date,
    resetPasswordToken?: string,
    resetPasswordExpires?: Date,
    avatar?: string,
    companyId: string | Types.ObjectId,
    zoneId: (string | Types.ObjectId)[],
    role?: RoleUserDocument[] | null
}


@Schema()
export class User extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: 'Company' })
    companyId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    documento: string;

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

    @Prop({ required: true, default: true })
    active: boolean;

    @Prop({ required: true, default: false })
    activeOtp: boolean;

    @Prop({ required: false, default: false })
    skipOtp: boolean;

    @Prop({ required: false, ref: 'Zone', type: [{ type: Types.ObjectId }] })
    zoneId: Types.ObjectId[];

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

    @Prop({ required: true, ref: RoleUser.name, type: [{ type: Types.ObjectId }] })
    roleId: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);