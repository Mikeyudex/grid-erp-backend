import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WoocommerceService } from './woocommerce.service';
import { CreateWoocommerceDto, UpdateWoocommerceDto } from './dto/woocommerce.dto';
import { Woocommerce } from './woocommerce.schema';

@ApiTags('woocommerce')
@Controller('woocommerce')
export class WoocommerceController {
    constructor(private readonly woocommerceService: WoocommerceService) { }

    @Post('/create')
    @ApiOperation({ summary: 'Crear un nuevo registro' })
    @ApiResponse({ status: 201, description: 'La empresa ha sido creado exitosamente.' })
    async create(@Body() createWoocommerceDto: CreateWoocommerceDto): Promise<Woocommerce> {
        return this.woocommerceService.create(createWoocommerceDto);
    }

    @Get('getAll')
    @ApiOperation({ summary: 'Obtener todos los registros' })
    @ApiResponse({ status: 200, description: 'Lista de empresas obtenida exitosamente.' })
    async findAll(): Promise<Woocommerce[]> {
        return this.woocommerceService.findAll();
    }

    @Get('get/:id')
    @ApiOperation({ summary: 'Obtener por id' })
    @ApiResponse({ status: 200, description: 'Registro encontrado.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async findOne(@Param('id') id: string): Promise<Woocommerce> {
        return this.woocommerceService.findOne(id);
    }

    @Get('getByCompanyId/:companyId')
    @ApiOperation({ summary: 'Obtener por companyId' })
    @ApiResponse({ status: 200, description: 'Registro encontrado.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async findByCompanyId(@Param('companyId') companyId: string): Promise<Woocommerce> {
        return this.woocommerceService.findByCompanyId(companyId);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Actualizar un regitro por ID' })
    @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async update(@Param('id') id: string, @Body() updateWoocommerceDto: UpdateWoocommerceDto): Promise<boolean> {
        return this.woocommerceService.update(id, updateWoocommerceDto);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Eliminar un registropor ID' })
    @ApiResponse({ status: 200, description: 'Registro eliminado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async delete(@Param('id') id: string): Promise<boolean> {
        return this.woocommerceService.delete(id);
    }

}