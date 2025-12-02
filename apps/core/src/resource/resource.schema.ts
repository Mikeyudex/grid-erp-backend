import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document, Types } from 'mongoose';

export type ResourceDocument = Resource & Document;

export interface IResource {
    id: string,
    name: string,
    description: string,
    path: string,
    createdAt?: Date,
    updatedAt?: Date,
}

@Schema()
export class Resource {

    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: false, default: '' })
    description: string;

    @Prop({ required: true, default: '/' })
    path: string;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
