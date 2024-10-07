import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
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
import { SettingsService } from '../settings/settings.service';
import { TaxesService } from '../taxes/taxes.service';
import { GetAllByCompanyProductsResponseDto } from './dto/response-getall-products.dto';
import { WarehouseService } from '../warehouse/warehouse.service';
import { Movement, TypeMovementEnum } from '../movement/movement.schema';
import { TypeProduct } from './typeProduct/typeProduct.schema';
import { CreateTypesProductDto } from './dto/typesProduct/typesProduct.dto';

@Injectable()
export class ProductsService {
  companyId: string;
  constructor(
    @InjectModel('Product') private readonly productModel: Model<ProductDocument>,
    @InjectModel('AttributeConfig') private readonly attributeConfigModel: Model<AttributeConfig>,
    @InjectModel('ProductCategory') private readonly productCategoryModel: Model<ProductCategory>,
    @InjectModel('ProductSubCategory') private readonly productSubCategoryModel: Model<ProductSubCategory>,
    @InjectModel('Movement') private readonly movementModel: Model<Movement>,
    @InjectModel('TypeProduct') private readonly typeProductModel: Model<TypeProduct>,
    private readonly stockService: StockService,
    private readonly unitOfMeasureService: UnitOfMeasureService,
    private readonly settingsService: SettingsService,
    private readonly taxesService: TaxesService,
    private readonly warehouseService: WarehouseService,
  ) { this.companyId = "3423f065-bb88-4cc5-b53a-63290b960c1a" }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    createProductDto.uuid = v4();
    createProductDto.companyId = "3423f065-bb88-4cc5-b53a-63290b960c1a"; //TODO el id de la compañia se debe sacar del token o la sesión de la solicitud

    const session: ClientSession = await this.productModel.db.startSession();
    session.startTransaction();

    try {
      //find by id unitOfMeasure
      const unitOfMeasure = await this.unitOfMeasureService.findOne(createProductDto.unitOfMeasureId);
      if (!unitOfMeasure) {
        throw new Error('Unit of Measure not found');
      }

      //find by id tax
      const tax = await this.taxesService.findOne(createProductDto.taxId);
      if (!tax) {
        throw new Error('tax not found');
      }

      const typeProduct = await this.getNameTypeProductById(createProductDto.id_type_product);
      if(!typeProduct) {
        throw new Error('typeProduct not found');
      }

      createProductDto.unitOfMeasureId = unitOfMeasure._id.toString();
      createProductDto.taxId = tax._id.toString();

      const newProduct = new this.productModel(createProductDto);

      const product = await newProduct.save();

      if(typeProduct !== 'Producto') {
        return product;
      }

      //Creando el stock para el produto recién creado
      const createStockDto: CreateStockDto = {
        productId: newProduct._id.toString(),
        quantity: createProductDto.quantity,
        warehouseId: createProductDto.warehouseId,
      }

      await this.stockService.create(createStockDto);
      await this.handleCreateMovement(createProductDto, product._id.toString())
      return product;
    } catch (error) {
      // Rollback de la transacción en caso de error
      await session.abortTransaction();
      throw error; // Re-lanzar el error para manejarlo en el controlador o en otro lugar
    } finally {
      session.endSession();
    }
  }

  async handleCreateMovement(createProductDto: CreateProductDto, idMongoProduct: string): Promise<void> {
    try {
      const { quantity, warehouseId } = createProductDto;
      let createMovementDto = {
        warehouseId: warehouseId,
        productId: idMongoProduct,
        type: TypeMovementEnum.E,
        quantity: quantity,
        reason: 'Creation',
        createdBy: '66d4ed2f825f2d54204555c1' //TODO se debe pasar el id del usuario, sacarlo del token jwt
      }
      await this.movementModel.create(createMovementDto);
      return;
    } catch (error) {
      throw error;
    }
  }

  async findAllByCompany(companyId: string, page: number = 1, limit: number = 50): Promise<GetAllByCompanyProductsResponseDto[]> {

    let response = [];
    const skip = (page - 1) * limit;
    let products = await this.productModel.find({ companyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    if (products.length === 0) {
      throw new NotFoundException(`Products by company not found`);
    }

    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      let category = await this.findProductCategoryByUuId(product.id_category);
      let subCategory = await this.findProductSubCategoryByUuId(product.id_sub_category);
      let warehouse = await this.warehouseService.findOne(product.warehouseId);
      let stockProduct = await this.stockService.findOneByProductId(product.id);

      const transformedProduct = {
        ...product.toObject(),
        categoryName: category.name,
        subCategoryName: subCategory.name,
        warehouseName: warehouse.name,
        stock: stockProduct?.quantity ?? 0,
        attributes: product.attributes || {},
        additionalConfigs: product.additionalConfigs || {}
      }
      response.push(transformedProduct)
    }

    return response as GetAllByCompanyProductsResponseDto[];
  }

  async findAllByWarehouse(warehouseId: string, page: number = 1, limit: number = 50): Promise<GetAllByCompanyProductsResponseDto[]> {

    let response = [];
    const skip = (page - 1) * limit;
    let warehouse = await this.warehouseService.findbyId(warehouseId);
    let products = await this.productModel.find({ warehouseId: warehouse.uuid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    if (products.length === 0) {
      throw new NotFoundException(`Products by warehouseId not found`);
    }

    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      let category = await this.findProductCategoryByUuId(product.id_category);
      let subCategory = await this.findProductSubCategoryByUuId(product.id_sub_category);
      let warehouse = await this.warehouseService.findOne(product.warehouseId);
      let stockProduct = await this.stockService.findOneByProductId(product.id);

      const transformedProduct = {
        ...product.toObject(),
        categoryName: category.name,
        subCategoryName: subCategory.name,
        warehouseName: warehouse.name,
        stock: stockProduct?.quantity ?? 0,
        attributes: product.attributes || {},
        additionalConfigs: product.additionalConfigs || {}
      }
      response.push(transformedProduct)
    }

    return response as GetAllByCompanyProductsResponseDto[];
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

  async findProductCategoriesFullSelect(companyId: string): Promise<any> {
    let categories = await this.productCategoryModel.find({ companyId }).lean();
    let categoriesFullSelect = [];
    for (let index = 0; index < categories.length; index++) {
      const category: ProductCategory = categories[index];
      let categorySelect = {
        label: category.name,
        value: category.uuid
      };
      let subCat = await this.findProductSubCategorysByCategoryId(category.uuid);
      let subcatSelect = subCat.map((subca: ProductSubCategory) => { return { label: subca.name, value: subca.uuid } })
      categoriesFullSelect.push(Object.assign({ ...categorySelect, subcategoriesSelect: subcatSelect }));
    }
    return categoriesFullSelect;
  }

  async findProductCategoryByCompanyId(companyId: string): Promise<ProductCategory> {
    return this.productCategoryModel.findOne({ companyId }).exec();
  }

  async findProductCategoryByUuId(uuid: string): Promise<ProductCategory> {
    return this.productCategoryModel.findOne({ uuid }).exec();
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

  async findProductSubCategoryByUuId(uuid: string): Promise<ProductSubCategory> {
    return this.productSubCategoryModel.findOne({ uuid }).exec();
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

    //Si no existen productos para la empresa, se debe buscar en la configuración de la empresa el initialSku y devolverlo.
    if (!lastProduct) {
      let setting = await this.settingsService.findBySettingName('products', this.companyId);

      if (Array.isArray(setting.value) && this.hasValueObject(setting.value, 'initialSku')) {
        let initialSku = setting.value.filter(val => val.initialSku)[0]['initialSku'];
        return initialSku as string;
      } else {
        return "1000";
      }
    }
    return lastProduct ? String(Number(lastProduct.sku) + 1) : null;
  }

  hasValueObject(values: any[], keyToFind: string): boolean {
    let value = values.find(item => item.hasOwnProperty(keyToFind));
    return value ? true : false;
  };

  async getTypesProduct() {
    let typeProducts = await this.typeProductModel.find().lean();
    return typeProducts;
  }

  async createTypesProduct(createTypesProductDto: CreateTypesProductDto) {
    let typeProductDoc = new this.typeProductModel(createTypesProductDto)
    return typeProductDoc.save();
  }

  async getNameProductById(id: string): Promise<string> {
    let product = await this.productModel.findById(id).projection({ name: 1 }).exec();
    return product.name;
  }

  async getNameTypeProductById(id: string): Promise<string> {
    let typeProduct = await this.typeProductModel.findById(id).projection({ name: 1 }).exec();
    return typeProduct.name;
  }

}
