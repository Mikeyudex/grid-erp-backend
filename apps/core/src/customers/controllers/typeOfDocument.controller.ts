import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { TypeOfDocumentService } from "../services/typeOfDocument.service";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { CreateTypeOfDocumentDto } from "../dtos/typeOfDocument.dto";

@Controller('typeOfDocument')
export class TypeOfDocumentController {

    constructor(
        private readonly typeOfDocumentService: TypeOfDocumentService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createTypeOfDocument(@Body() createTypeOfDocumentDto: CreateTypeOfDocumentDto) {
        return this.typeOfDocumentService.create(createTypeOfDocumentDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('getAll')
    async getAllTypeOfDocuments() {
        return this.typeOfDocumentService.getAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('getById/:id')
    async getTypeOfDocumentById( @Param('id') id: string) {
        return this.typeOfDocumentService.getById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/:id')
    async updateTypeOfDocument(@Body() updateTypeOfDocumentDto: CreateTypeOfDocumentDto, @Param('id') id: string) {
        return this.typeOfDocumentService.update(updateTypeOfDocumentDto, id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deleteTypeOfDocument( @Param('id') id: string) {
        return this.typeOfDocumentService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('bulkDelete')
    async bulkDeleteTypeOfDocument(@Body() payload: Record<string, any>) {
        return this.typeOfDocumentService.bulkDelete(payload?.ids);
    }

}