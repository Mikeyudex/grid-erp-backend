import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { TaxDocument } from './taxes.schema';

@Controller('taxes')
export class TaxesController {
    constructor(private readonly taxesService: TaxesService) { }

    @Post()
    async create(@Body() createTaxDto: CreateTaxDto): Promise<TaxDocument> {
        return this.taxesService.create(createTaxDto);
    }

    @Get('')
    async findAll(): Promise<TaxDocument[]> {
        return this.taxesService.findAll();
    }

    @Get('/getbyCompany')
    async findAllByCompany(): Promise<TaxDocument[]> {
        return this.taxesService.findAllByCompany();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<TaxDocument> {
        return this.taxesService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateTaxDto: UpdateTaxDto): Promise<TaxDocument> {
        return this.taxesService.update(id, updateTaxDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.taxesService.remove(id);
    }
}
