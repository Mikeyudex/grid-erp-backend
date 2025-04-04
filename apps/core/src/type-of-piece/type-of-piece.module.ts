import { Module } from '@nestjs/common';
import { TypeOfPieceService } from './type-of-piece.service';
import { TypeOfPieceController } from './type-of-piece.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOfPiece, TypeOfPieceSchema } from './type-of-piece.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TypeOfPiece.name, schema: TypeOfPieceSchema }]),
  ],
  providers: [TypeOfPieceService],
  controllers: [TypeOfPieceController],
  exports: [TypeOfPieceService],
})
export class TypeOfPieceModule { }
