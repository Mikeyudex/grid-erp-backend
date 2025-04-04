import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Query } from '@nestjs/common';
import { PreciosTapeteMaterialService } from './precios-tapete-material.service';
import { CreatePrecioTapeteMaterialDto, UpdatePrecioTapeteMaterialDto } from './precios-tapete-material.dto';

@Controller('precios-tapete-material')
export class PreciosTapeteMaterialController {
    constructor(
        private readonly preciosTapeteMaterialService: PreciosTapeteMaterialService
    ) { }

    @Get()
    async findAll() {
        return this.preciosTapeteMaterialService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.preciosTapeteMaterialService.findOne(id);
    }

    @Post()
    async create(@Body() createPrecioTapeteMaterialDto: CreatePrecioTapeteMaterialDto) {
        return this.preciosTapeteMaterialService.create(createPrecioTapeteMaterialDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updatePrecioTapeteMaterialDto: UpdatePrecioTapeteMaterialDto) {
        return this.preciosTapeteMaterialService.update(id, updatePrecioTapeteMaterialDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.preciosTapeteMaterialService.delete(id);
    }

    @Get('/calcular-precio-final/:productId/:tipoTapete/:material/:cantidad')
    async calcularPrecioFinal(@Param('productId') productId: string, @Param('tipoTapete') tipoTapete: string, @Param('material') material: string, @Param('cantidad') cantidad: number) {
        try {
            return this.preciosTapeteMaterialService.calcularPrecioFinal(productId, tipoTapete, material, cantidad);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: error,
                error: error.message || 'Unknown error',
            });
        }

    }
}
