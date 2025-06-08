import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

export type SubAccountCategoryDocument = SubAccountCategory & Document;

export interface ISubAccountCategory {
    name: string;
    code: number;
}

@Schema()
export class SubAccountCategory {

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: Number })
    code: number;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const SubAccountCategorySchema = SchemaFactory.createForClass(SubAccountCategory);