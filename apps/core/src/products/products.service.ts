import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { AttributeConfig } from './attribute-config.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 } from 'uuid';
import { CreateAttributeConfigDto } from './dto/create-attribute-config.dto';
import { CreateCategoryDto } from './dto/category/create-category.dto';
import { ProductCategory } from './category/category.schema';
import { UpdateCategoryDto } from './dto/category/update-category.dto';
import { ProductSubCategory } from './subcategory/subcategory.schema';
import { CreateProductSubCategoryDto } from './dto/subcategory/create-subcategory.dto';
import { UpdateProductSubCategoryDto } from './dto/subcategory/update-subcategory.dto';
import { CreateStockDto } from '../stock/dto/create-stock.dto';
import { StockService } from '../stock/stock.service';
import { UnitOfMeasureService } from '../unit-of-measure/unit-of-measure.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<ProductDocument>,
    @InjectModel('AttributeConfig') private readonly attributeConfigModel: Model<AttributeConfig>,
    @InjectModel('ProductCategory') private readonly productCategoryModel: Model<ProductCategory>,
    @InjectModel('ProductSubCategory') private readonly productSubCategoryModel: Model<ProductSubCategory>,
    private readonly stockService: StockService,
    private readonly unitOfMeasureService: UnitOfMeasureService
  ) { }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    createProductDto.uuid = v4();
    createProductDto.companyId = "3423f065-bb88-4cc5-b53a-63290b960c1a"; //TODO

    //find by id unitOfMeasure
    const unitOfMeasure = await this.unitOfMeasureService.findOne(createProductDto.unitOfMeasureId);
    if (!unitOfMeasure) {
      throw new Error('Unit of Measure not found');
    }

    createProductDto.unitOfMeasureId = unitOfMeasure._id.toString();
    const newProduct = new this.productModel(createProductDto);

    const product = await newProduct.save();

    //Creando el stock para el produto recién creado
    const createStockDto: CreateStockDto = {
      productId: newProduct._id.toString(),
      quantity: createProductDto.quantity,
      warehouseId: createProductDto.warehouseId,
    }

    await this.stockService.create(createStockDto);
    return product;

  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async delete(id: string): Promise<Product> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return deletedProduct;
  }

  async findAttributeConfigs(): Promise<AttributeConfig[]> {
    return this.attributeConfigModel.find().exec();
  }

  async findAttributeConfigsByCompanyId(companyId: string): Promise<AttributeConfig[]> {
    return this.attributeConfigModel.find({ companyId }).exec();
  }

  async createAttributeConfig(createAttributeConfigDto: CreateAttributeConfigDto): Promise<AttributeConfig> {
    createAttributeConfigDto.uuid = v4();
    const newAttributeConfig = new this.attributeConfigModel(createAttributeConfigDto);
    return newAttributeConfig.save();
  }

  async createProductCategory(createCategoryDto: CreateCategoryDto): Promise<ProductCategory> {
    createCategoryDto.uuid = v4();
    const newProductCategory = new this.productCategoryModel(createCategoryDto);
    return newProductCategory.save();
  }

  async findProductCategorysByCompanyId(companyId: string): Promise<ProductCategory[]> {
    return this.productCategoryModel.find({ companyId }).exec();
  }

  async findProductCategoriesFull(companyId: string): Promise<any> {
    let categories = await this.productCategoryModel.find({ companyId }).lean();
    let categoriesFull = [];
    for (let index = 0; index < categories.length; index++) {
      const category: ProductCategory = categories[index];
      let subCat = await this.findProductSubCategorysByCategoryId(category.uuid);
      categoriesFull.push(Object.assign({ ...category, subcategories: subCat }));
    }
    return categoriesFull;
  }

  async findProductCategoryByCompanyId(companyId: string): Promise<ProductCategory> {
    return this.productCategoryModel.findOne({ companyId }).exec();
  }

  async updateProductCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<ProductCategory> {
    const updatedProductCategory = await this.productCategoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true }).exec();
    if (!updatedProductCategory) {
      throw new NotFoundException(`ProductCategory with ID ${id} not found`);
    }
    return updatedProductCategory;
  }

  async createProductSubCategory(createProductSubCategoryDto: CreateProductSubCategoryDto): Promise<ProductSubCategory> {
    createProductSubCategoryDto.uuid = v4();
    const newProductSubCategory = new this.productSubCategoryModel(createProductSubCategoryDto);
    return newProductSubCategory.save();
  }

  async findProductSubCategorysByCategoryId(categoryId: string): Promise<ProductSubCategory[]> {
    return this.productSubCategoryModel.find({ categoryId }).exec();
  }

  async updateProductSubCategory(id: string, updateProductSubCategoryDto: UpdateProductSubCategoryDto): Promise<ProductSubCategory> {
    const updatedProductSubCategoryDto = await this.productSubCategoryModel.findByIdAndUpdate(id, updateProductSubCategoryDto, { new: true }).exec();
    if (!updatedProductSubCategoryDto) {
      throw new NotFoundException(`ProductsubCategory with ID ${id} not found`);
    }
    return updatedProductSubCategoryDto;
  }

  async getLastSkuByCompany(companyId: string): Promise<string | null> {
    const lastProduct = await this.productModel
      .findOne({ companyId })  // Filtrar por companyId
      .sort({ sku: -1 })        // Ordenar por SKU en orden descendente
      .select('sku')            // Seleccionar solo el campo sku
      .exec();

    return lastProduct ? String(Number(lastProduct.sku) + 1) : null;
  }

}
