import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Document } from 'mongoose';

export type TypeOfPieceDocument = TypeOfPiece & Document;

@Schema()
export class TypeOfPiece {

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ required: false })
    shortCode?: string;

    @Prop({ default: () => getCurrentUTCDate() })
    createdAt: Date;

    @Prop({ default: null })
    updatedAt: Date;
}

export const TypeOfPieceSchema = SchemaFactory.createForClass(TypeOfPiece);