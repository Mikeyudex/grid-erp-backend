import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';

export type RoleUserDocument = RoleUser & Document;

export interface IRoleUser {
    id: string,
    name: string,
    description: string,
    resources: string[],
    createdAt?: Date,
    updatedAt?: Date,
}

export enum roleUser {
    DEFAULT = 'default',
}

@Schema()
export class RoleUser {

    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: false, default: '' })
    description: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }] })
    resources: string[];

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const RoleUserSchema = SchemaFactory.createForClass(RoleUser);
