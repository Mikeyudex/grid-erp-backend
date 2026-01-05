import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { TaxDocument } from './taxes.schema';

@Controller('taxes')
export class TaxesController {
    private mockupCompanyId: string;
    constructor(private readonly taxesService: TaxesService) {
        this.mockupCompanyId = "66becedd790bddbc9b1e2cbc";
    }

    @Post()
    async create(@Body() createTaxDto: CreateTaxDto): Promise<TaxDocument> {
        return this.taxesService.create(createTaxDto);
    }

    @Get('')
    async findAll(): Promise<TaxDocument[]> {
        return this.taxesService.findAll();
    }

    @Get('/getbyCompany/:companyId')
    async findAllByCompany(@Param('companyId') companyId: string): Promise<TaxDocument[]> {
        companyId = this.mockupCompanyId;
        return this.taxesService.findAllByCompany(companyId);
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
