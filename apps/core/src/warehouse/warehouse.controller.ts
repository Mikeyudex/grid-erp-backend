import { Controller, Get, Post, Body, Param, Put, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './warehouse.schema';

@ApiTags('Warehouse')
@Controller('warehouse')
export class WarehouseController {
    constructor(private readonly warehouseService: WarehouseService) { }

    @Post('/create')
    @ApiOperation({ summary: 'Crear una bodega' })
    @ApiResponse({ status: 201, description: 'La bodega ha sido creado exitosamente.' })
    async create(@Body() createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
        return this.warehouseService.create(createWarehouseDto);
    }

    @Get('getAll')
    @ApiOperation({ summary: 'Obtener todas las bodega' })
    @ApiResponse({ status: 200, description: 'Lista de bodegas obtenida exitosamente.' })
    async findAll(): Promise<Warehouse[]> {
        return this.warehouseService.findAll();
    }

    @Get('getbyCompany')
    @ApiOperation({ summary: 'Obtener todas las bodega por compañía' })
    @ApiResponse({ status: 200, description: 'Lista de bodegas obtenida exitosamente.' })
    async findAllByCompany(@Query('companyId') companyId: string,@Res() res: Response){
        try {
            let data = await this.warehouseService.findAllByCompany(companyId);
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
    @ApiOperation({ summary: 'Obtener una bodega por UUID' })
    @ApiResponse({ status: 200, description: 'Registro encontrado.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async findOne(@Param('id') id: string): Promise<Warehouse> {
        return this.warehouseService.findOne(id);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Actualizar una bodega por ID' })
    @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto): Promise<boolean> {
        return this.warehouseService.update(id, updateWarehouseDto);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Eliminar una bodega por ID' })
    @ApiResponse({ status: 200, description: 'Registro eliminado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async delete(@Param('id') id: string): Promise<boolean> {
        return this.warehouseService.delete(id);
    }

}