import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoryMappingDto, UpdateCategoryMappingDto } from './dto/category-mapping.dto';
import { CategoryMapping } from './category-mapping.schema';
import { CategoryMappingService } from './category-mapping.service';

@Controller('category-mapping')
export class CategoryMappingController {

    constructor(private readonly categoryMappingService: CategoryMappingService) { }

    @Post('/create')
    @ApiOperation({ summary: 'Crear un registro' })
    @ApiResponse({ status: 201, description: 'El mapeo de categorías ha sido creado exitosamente.' })
    async create(@Body() createCategoryMappingDto: CreateCategoryMappingDto): Promise<CategoryMapping> {
        return this.categoryMappingService.create(createCategoryMappingDto);
    }

    @Get('getAll')
    @ApiOperation({ summary: 'Obtener todos los registros' })
    @ApiResponse({ status: 200, description: 'Lista de empresas obtenida exitosamente.' })
    async findAll(): Promise<CategoryMapping[]> {
        return this.categoryMappingService.findAll();
    }

    @Get('get/:id')
    @ApiOperation({ summary: 'Obtener un registro' })
    @ApiResponse({ status: 200, description: 'Registro encontrado.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async findOne(@Param('id') id: string): Promise<CategoryMapping> {
        return this.categoryMappingService.findOne(id);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Actualizar un registro' })
    @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async update(@Param('id') id: string, @Body() updateCategoryMappingDto: UpdateCategoryMappingDto): Promise<boolean> {
        return this.categoryMappingService.update(id, updateCategoryMappingDto);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Eliminar un registro' })
    @ApiResponse({ status: 200, description: 'Registro eliminado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async delete(@Param('id') id: string): Promise<boolean> {
        return this.categoryMappingService.delete(id);
    }
}
