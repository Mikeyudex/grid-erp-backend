import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { TypeOfPiece, TypeOfPieceDocument } from './type-of-piece.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TypeOfPieceService {

    constructor(@InjectModel(TypeOfPiece.name) private readonly typeOfPieceModel: Model<TypeOfPieceDocument>) { }

    async findAll(): Promise<TypeOfPiece[]> {
        return this.typeOfPieceModel.find().exec();
    }

    async findOne(id: string): Promise<TypeOfPiece> {
        return this.typeOfPieceModel.findById(id).exec();
    }

    async create(typeOfPiece: TypeOfPiece): Promise<TypeOfPieceDocument> {
        return this.typeOfPieceModel.create(typeOfPiece);
    }

    async update(id: string, typeOfPiece: TypeOfPiece): Promise<TypeOfPieceDocument> {
        return this.typeOfPieceModel.findByIdAndUpdate(id, typeOfPiece, { new: true }).exec();
    }

    async delete(id: string): Promise<TypeOfPieceDocument> {
        return this.typeOfPieceModel.findByIdAndDelete(id).exec();
    }
}
