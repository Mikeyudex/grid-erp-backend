import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TypeOfPieceService } from './type-of-piece.service';
import { TypeOfPiece } from './type-of-piece.schema';

@Controller('type-of-piece')
export class TypeOfPieceController {
    constructor(private readonly typeOfPieceService: TypeOfPieceService) { }

    @Get()
    async findAll() {
        return this.typeOfPieceService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.typeOfPieceService.findOne(id);
    }

    @Post()
    async create(@Body() typeOfPiece: TypeOfPiece) {
        return this.typeOfPieceService.create(typeOfPiece);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() typeOfPiece: TypeOfPiece) {
        return this.typeOfPieceService.update(id, typeOfPiece);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.typeOfPieceService.delete(id);
    }

}
