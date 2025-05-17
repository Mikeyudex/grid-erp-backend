import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Res,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseFilters,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  UseGuards,
  SetMetadata,
  UploadedFile,
  InternalServerErrorException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AttributeConfig } from './interfaces/attribute-config.interface';
import { Product } from './interfaces/products.interface';
import { CreateAttributeConfigDto } from './dto/create-attribute-config.dto';
import { CreateCategoryDto } from './dto/category/create-category.dto';
import { UpdateCategoryDto } from './dto/category/update-category.dto';
import { ProductCategory } from './category/category.schema';
import { CreateProductSubCategoryDto } from './dto/subcategory/create-subcategory.dto';
import { ProductSubCategory } from './subcategory/subcategory.schema';
import { OracleCloudService } from '../oracle-cloud.service';
import { GetAllByCompanyProductsResponseDto } from './dto/response-getall-products.dto';
import config from '../config';
import { PublicController } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateTypesProductDto } from './dto/typesProduct/typesProduct.dto';

@ApiTags('products')
/* @UseGuards(JwtAuthGuard) */ //Valida si el Bearer token es válido.
@Controller('products')
export class ProductsController {
  private defaultFolderProducts: string;
  private mockupCompanyId: string;

  constructor(
    private readonly productService: ProductsService,
    private readonly oracleCloudService: OracleCloudService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {
    this.mockupCompanyId = "3423f065-bb88-4cc5-b53a-63290b960c1a";
    this.defaultFolderProducts = `company-${this.mockupCompanyId}/products/images/`;

  }

  @Post('/create')
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'El producto ha sido creado exitosamente.' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);

  }

  @Get('/getAllByCompany')
  @ApiOperation({ summary: 'Obtener todos los productos de una compañía' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente.' })
  async findAll(@Query('page') page: number, @Query('limit') limit: number): Promise<{ totalRowCount: number, data: GetAllByCompanyProductsResponseDto[] }> {
    return this.productService.findAllByCompany(this.mockupCompanyId, page, limit);
  }

  @Get('/getAllByCompanyLite')
  @ApiOperation({ summary: 'Obtener todos los productos de una compañía solo devuelve el nombre y el id' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente.' })
  async findAllLite(@Query('page') page: number, @Query('limit') limit: number) {
    return this.productService.findAllByCompanyLite(this.mockupCompanyId, page, limit);
  }

  @Get('/getAllByWarehouse/:warehouseId')
  @ApiOperation({ summary: 'Obtener todos los productos de una bodega en especifico' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente.' })
  async findAllByWarehouse(@Query('page') page: number, @Query('limit') limit: number, @Param('warehouseId') warehouseId: string): Promise<GetAllByCompanyProductsResponseDto[]> {
    return this.productService.findAllByWarehouse(warehouseId, page, limit);
  }

  @Get('/getProduct/:id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put('/update/:id')
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

  @UseGuards(JwtAuthGuard)
  @Put('/category/update/:id')
  async updateProductCategory(
    @Param('id') id: string,
    @Body() createCategoryDto: UpdateCategoryDto
  ): Promise<ProductCategory> {
    return this.productService.updateProductCategory(id, createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/category/delete/:id')
  async deleteProductCategory(
    @Param('id') id: string
  ): Promise<ProductCategory> {
    return this.productService.deleteProductCategory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/category/bulkDelete')
  async bulkDeleteProductCategory(
    @Body() payload: Record<string, any>
  ): Promise<any> {
    return this.productService.bulkDeleteProductCategory(payload?.ids);
  }

  // Endpoint para obtener las categorías
  @Get('/category/getByCompanyId/:companyId')
  async findProductCategory(@Param('companyId') companyId: string, @Res() res: Response, @Query('page') page: number, @Query('limit') limit: number) {
    let response = await this.productService.findProductCategorysByCompanyId(companyId, page, limit);
    return res.status(200).json({
      success: true,
      data: response.data,
      errorMessage: ""
    });
  }

  // Endpoint para obtener las categorías
  @Get('/category/getCategoriesFull')
  async findProductCategoryFull(@Query('companyId') companyId: string, @Query('page') page: number, @Query('limit') limit: number, @Res() res: Response) {
    try {
      let data = await this.productService.findProductCategoriesFull(companyId, page, limit);
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

  // Endpoint para obtener las categorías en formato Select
  @Get('/category/getCategoriesFullSelect')
  async findProductCategoryFullSelect(@Query('companyId') companyId: string, @Res() res: Response) {
    try {
      let data = await this.productService.findProductCategoriesFullSelect(companyId);
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

  // Endpoint para obtener los tipos de productos
  @Get('/types-product/getAll')
  async findTypeProduct(@Res() res: Response) {
    try {
      let data = await this.productService.getTypesProduct();
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

  // Endpoint para crear un tipo de producto
  @Post('/types-product/create')
  async createTypeProduct(@Body() createTypesProductDto: CreateTypesProductDto) {
    return this.productService.createTypesProduct(createTypesProductDto);
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

  @PublicController() //Este decorador sirve para desproteger una ruta en especifico si se tiene un guard en la raiz del controlador
  @Post('/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'tmp'),
        filename: (req, file, cb) => {
          // Generar un nombre único para el archivo
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Validación de tipo de archivo
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Solo se permiten archivos de imagen.'), false);
        }
        cb(null, true);
      }
    }),
  )
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'El producto ha sido creado exitosamente.' })
  async uploadImages(@UploadedFiles() files: Express.Multer.File) {

    if (!files) {
      throw new BadRequestException('Archivo no encontrado o tipo de archivo no permitido.');
    }

    let file = files[0];
    const bucketName = this.configService.oci.bucketName;
    const storageId = this.oracleCloudService.makeStorageId();
    const objectName = `${this.defaultFolderProducts}${storageId}.${file.mimetype.split('/')[1]}`;
    const filePath = file.path;
    try {
      const urlObject = await this.oracleCloudService.uploadFileToBucket(bucketName, objectName, filePath, file?.mimetype);
      return { url: urlObject, storageId };
    } catch (error) {
      throw new BadRequestException('File upload failed');
    }
  }

  @Delete('/deleteFile/:filename')
  async deleteFile(@Param('filename') filename: string) {
    try {
      const objectName = `${this.defaultFolderProducts}${filename}`;
      await this.oracleCloudService.deleteFile(this.configService.oci.bucketName, objectName);
      return {
        status: 'success',
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new HttpException('File not found or deletion failed', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('deleteProduct/:id')
  async deleteProduct(@Param('id') id: string, @Res() res: Response) {
    try {
      const deletedProduct = await this.productService.delete(id);
      return res.status(200).json({
        success: true,
        data: deletedProduct,
        errorMessage: ""
      });
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Error interno del servidor',
        error: error.message || 'Unknown error',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/product/bulkDelete')
  async deleteProducts(@Body() payload: Record<string, any>) {
    try {
      const deletedProducts = await this.productService.bulkDelete(payload?.ids);
      return {
        success: true,
        data: deletedProducts,
        errorMessage: ""
      };
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Error interno del servidor',
        error: error.message || 'Unknown error',
      });
    }
  }
}
