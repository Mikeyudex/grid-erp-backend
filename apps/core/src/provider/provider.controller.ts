import { Controller, Get, Post, Body, Param, Put, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderErp } from './provider.schema';

@ApiTags('Provider')
@Controller('provider')
export class ProviderController {
    constructor(private readonly providerService: ProviderService) { }

    @Post('/create')
    @ApiOperation({ summary: 'Crear un proveedor' })
    @ApiResponse({ status: 201, description: 'El proveedor ha sido creado exitosamente.' })
    async create(@Body() createProviderDto: CreateProviderDto): Promise<ProviderErp> {
        return this.providerService.create(createProviderDto);
    }

    @Get('getAll')
    @ApiOperation({ summary: 'Obtener todos los proveedores' })
    @ApiResponse({ status: 200, description: 'Lista de proveedores obtenida exitosamente.' })
    async findAll(): Promise<ProviderErp[]> {
        return this.providerService.findAll();
    }

    @Get('getbyCompany')
    @ApiOperation({ summary: 'Obtener todos los proveedores por compañía' })
    @ApiResponse({ status: 200, description: 'Lista de proveedores obtenida exitosamente.' })
    async findAllByCompany(@Query('companyId') companyId: string, @Res() res: Response){
        try {
            let data = await this.providerService.findAllByCompany(companyId);
            return res.status(200).json({
              success: true,
              data,
              errorMessage: ""
            });
          } catch (error) {
            return res.status(500).json({
              success: false,
              data: [],
              errorMessage: "Internal Error"
            });
          }
    }

    @Get('get/:id')
    @ApiOperation({ summary: 'Obtener un proveedor por UUID' })
    @ApiResponse({ status: 200, description: 'Registro encontrado.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async findOne(@Param('id') id: string): Promise<ProviderErp> {
        return this.providerService.findOne(id);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Actualizar un proveedor por ID' })
    @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto): Promise<boolean> {
        return this.providerService.update(id, updateProviderDto);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Eliminar un proveedor por ID' })
    @ApiResponse({ status: 200, description: 'Registro eliminado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async delete(@Param('id') id: string): Promise<boolean> {
        return this.providerService.delete(id);
    }

}