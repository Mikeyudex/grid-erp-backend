import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './company.schema';

@ApiTags('company')
@Controller('company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) { }

    @Post('/create')
    @ApiOperation({ summary: 'Crear una nueva empresa' })
    @ApiResponse({ status: 201, description: 'La empresa ha sido creado exitosamente.' })
    async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
        return this.companyService.create(createCompanyDto);
    }

    @Get('getAll')
    @ApiOperation({ summary: 'Obtener todas las empresas' })
    @ApiResponse({ status: 200, description: 'Lista de empresas obtenida exitosamente.' })
    async findAll(): Promise<Company[]> {
        return this.companyService.findAll();
    }

    @Get('get/:id')
    @ApiOperation({ summary: 'Obtener una empresa por UUID' })
    @ApiResponse({ status: 200, description: 'Registro encontrado.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async findOne(@Param('id') id: string): Promise<Company> {
        return this.companyService.findOne(id);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Actualizar una empresa por ID' })
    @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto): Promise<boolean> {
        return this.companyService.update(id, updateCompanyDto);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Eliminar una empresa por ID' })
    @ApiResponse({ status: 200, description: 'Registro eliminado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async delete(@Param('id') id: string): Promise<boolean> {
        return this.companyService.delete(id);
    }

}