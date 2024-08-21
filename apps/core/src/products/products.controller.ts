import { Controller, Get, Post, Body, Param, Put, Delete, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AttributeConfig } from './interfaces/attribute-config.interface';
import { Product } from './interfaces/products.interface';
import { CreateAttributeConfigDto } from './dto/create-attribute-config.dto';
import { Response } from 'express';
import { CreateCategoryDto } from './dto/category/create-category.dto';
import { ProductCategory } from './category/category.schema';
import { CreateProductSubCategoryDto } from './dto/subcategory/create-subcategory.dto';
import { ProductSubCategory } from './subcategory/subcategory.schema';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) { }

  @Post('/create')
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'El producto ha sido creado exitosamente.' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get('/getAll')
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente.' })
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get('/getProduct/:id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put('/update:id')
  @ApiOperation({ summary: 'Actualizar un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async delete(@Param('id') id: string): Promise<Product> {
    return this.productService.delete(id);
  }

  // Endpoint para obtener los atributos configurables por id de la empresa
  @Get('/attributes/getByCompanyId/:companyId')
  async findAttributeConfigs(@Param('companyId') companyId: string, @Res() res: Response) {
    try {
      let data = await this.productService.findAttributeConfigsByCompanyId(companyId);
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

  // Endpoint para crear un nuevo atributo configurable
  @Post('/attributes/create')
  async createAttributeConfig(
    @Body() createAttributeConfigDto: CreateAttributeConfigDto
  ): Promise<AttributeConfig> {
    return this.productService.createAttributeConfig(createAttributeConfigDto);
  }

  // Endpoint para crear una categoría
  @Post('/category/create')
  async createProductCategory(
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<ProductCategory> {
    return this.productService.createProductCategory(createCategoryDto);
  }

  // Endpoint para obtener las categorías
  @Get('/category/getByCompanyId/:companyId')
  async findProductCategory(@Param('companyId') companyId: string, @Res() res: Response) {
    try {
      let data = await this.productService.findProductCategorysByCompanyId(companyId);
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

  // Endpoint para obtener las categorías
  @Get('/category/getCategoriesFull')
  async findProductCategoryFull(@Query('companyId') companyId: string, @Res() res: Response) {
    try {
      let data = await this.productService.findProductCategoriesFull(companyId);
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

  // Endpoint para crear una subcategoría
  @Post('/subcategory/create')
  async createProductSubCategory(
    @Body() CreateProductSubCategoryDto: CreateProductSubCategoryDto
  ): Promise<ProductSubCategory> {
    return this.productService.createProductSubCategory(CreateProductSubCategoryDto);
  }

  // Endpoint para obtener subcategorías by categoría
  @Get('/subcategory/getByCategoryId/:categoryId')
  async findProductSubCategory(@Param('categoryId') categoryId: string, @Res() res: Response) {
    try {
      let data = await this.productService.findProductSubCategorysByCategoryId(categoryId);
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

  @Get('last-sku/:companyId')
  async getLastSku(@Param('companyId') companyId: string): Promise<{ lastSku: string | null }> {
    const lastSku = await this.productService.getLastSkuByCompany(companyId);
    return { lastSku };
  }
}
