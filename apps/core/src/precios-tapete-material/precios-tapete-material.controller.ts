import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PreciosTapeteMaterialService } from './precios-tapete-material.service';
import { CreatePrecioTapeteMaterialDto, UpdatePrecioTapeteMaterialDto } from './precios-tapete-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

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

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatePrecioTapeteMaterialDto: UpdatePrecioTapeteMaterialDto) {
        return this.preciosTapeteMaterialService.update(id, updatePrecioTapeteMaterialDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.preciosTapeteMaterialService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('bulkDelete')
    async bulkDelete(@Body() payload: Record<string, any>) {
        return this.preciosTapeteMaterialService.bulkDelete(payload?.ids);
    }

    @Get('/calcular-precio-final/:productId/:tipoTapete/:material/:cantidad/:typeCustomerId')
    async calcularPrecioFinal(
        @Param('productId') productId: string,
        @Param('tipoTapete') tipoTapete: string,
        @Param('material') material: string,
        @Param('cantidad') cantidad: number,
        @Param('typeCustomerId') typeCustomerId: string
    ) {
        try {
            return this.preciosTapeteMaterialService.calcularPrecioFinal(productId, tipoTapete, material, cantidad, typeCustomerId);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: error,
                error: error.message || 'Unknown error',
            });
        }

    }

    @Get('/calcular-precio-final-from-baseprice/:basePrice/:tipoTapete/:material/:cantidad/:typeCustomerId')
    async calcularPrecioFinalFromBasePrice(
        @Param('basePrice') basePrice: string,
        @Param('tipoTapete') tipoTapete: string,
        @Param('material') material: string,
        @Param('cantidad') cantidad: number,
        @Param('typeCustomerId') typeCustomerId: string
    ) {
        try {
            return this.preciosTapeteMaterialService.calcularPrecioFinalDesdePrecioBase(basePrice, tipoTapete, material, cantidad, typeCustomerId);
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
