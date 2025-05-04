import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
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
      let unitOfMeasure = null;
      let tax = null;

      //find by id unitOfMeasure
      if (createProductDto.unitOfMeasureId) {
        unitOfMeasure = await this.unitOfMeasureService.findOne(createProductDto.unitOfMeasureId);
        if (!unitOfMeasure) {
          throw new Error('Unit of Measure not found');
        }
      }

      //find by id tax
      if (createProductDto.taxId) {
        tax = await this.taxesService.findOne(createProductDto.taxId);
        if (!tax) {
          throw new Error('tax not found');
        }
      }

      const typeProduct = await this.getNameTypeProductById(createProductDto.id_type_product);
      if (!typeProduct) {
        throw new Error('typeProduct not found');
      }

      const typeOfPiecesObjectId = createProductDto.typeOfPieces.map(t => new Types.ObjectId(t));

      createProductDto.unitOfMeasureId = unitOfMeasure ? unitOfMeasure._id.toString() : null;
      createProductDto.taxId = tax ? tax._id.toString() : null;

      if (!createProductDto.id_sub_category) {
        createProductDto.id_sub_category = "680aaf320d033722d44d4bff";
      }

      const newProduct = new this.productModel(createProductDto);
      newProduct.typeOfPieces = typeOfPiecesObjectId;

      const product = await newProduct.save();

      /* if (typeProduct !== 'Producto') {
        return product;
      } */

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
      console.log(error);
      // Rollback de la transacción en caso de error
      await session.abortTransaction();
      throw error; // Re-lanzar el error para manejarlo en el controlador o en otro lugar
    } finally {
      session.endSession();
    }
  }

  async handleCreateMovement(createProductDto: CreateProductDto, idMongoProduct: string): Promise<void> {
    try {
      const { quantity, warehouseId, companyId } = createProductDto;
      let createMovementDto = {
        companyId: companyId,
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

  async findAllByCompany(companyId: string, page: number = 1, limit: number = 10): Promise<{ totalRowCount: number, data: GetAllByCompanyProductsResponseDto[] }> {

    let response = [];
    const skip = (page - 1) * limit;
    let products = await this.productModel.find({ companyId })
      .populate('id_category')
      .populate('id_sub_category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    if (products.length === 0) {
      throw new NotFoundException(`Products by company not found`);
    }

    for (let index = 0; index < products.length; index++) {
      const product: any = products[index];
      let warehouse = await this.warehouseService.findOne(product.warehouseId);
      let stockProduct = await this.stockService.findOneByProductId(product.id);

      const transformedProduct = {
        ...product.toObject(),
        categoryName: product.id_category.name,
        subCategoryName: product.id_sub_category.name,
        warehouseName: warehouse.name,
        stock: stockProduct?.quantity ?? 0,
        attributes: product.attributes || {},
        additionalConfigs: product.additionalConfigs || {}
      }
      response.push(transformedProduct)
    }

    const totalRowCount = await this.productModel.countDocuments({ companyId })

    return {
      totalRowCount: totalRowCount,
      data: response as GetAllByCompanyProductsResponseDto[]
    }
  }

  async findAllByCompanyLite(companyId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      let products = await this.productModel.find({ companyId })
        .populate('typeOfPieces')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      if (products.length === 0) {
        throw new NotFoundException(`Products by company not found`);
      }

      let productsMap = products.map((product: ProductDocument) => {
        return {
          name: product.name,
          id: product._id.toString(),
          salePrice: product.salePrice,
          typeOfPieces: product.typeOfPieces.map((type: any) => {
            return {
              _id: type._id.toString(),
              name: type?.name,
            }
          }),
        }
      });

      return {
        data: productsMap
      }
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Error interno del servidor',
        error: error.message || 'Unknown error',
      });
    }
  }

  async findAllByWarehouse(warehouseId: string, page: number = 1, limit: number = 50): Promise<GetAllByCompanyProductsResponseDto[]> {

    let response = [];
    const skip = (page - 1) * limit;
    let warehouse = await this.warehouseService.findbyId(warehouseId);
    let products = await this.productModel.find({ warehouseId: warehouse.uuid })
      .populate('id_category')
      .populate('id_sub_category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    if (products.length === 0) {
      throw new NotFoundException(`Products by warehouseId not found`);
    }

    for (let index = 0; index < products.length; index++) {
      const product: any = products[index];
      let warehouse = await this.warehouseService.findOne(product.warehouseId);
      let stockProduct = await this.stockService.findOneByProductId(product.id);

      const transformedProduct = {
        ...product.toObject(),
        categoryName: product.id_category?.name,
        subCategoryName: product.id_sub_category?.name,
        warehouseName: warehouse?.name,
        stock: stockProduct?.quantity ?? 0,
        attributes: product.attributes || {},
        additionalConfigs: product.additionalConfigs || {}
      }
      response.push(transformedProduct)
    }

    return response as GetAllByCompanyProductsResponseDto[];
  }

  async findOne(id: string | Types.ObjectId): Promise<Product> {
    const product = await this.productModel.findById(id)
      .populate('id_category')
      .populate('id_sub_category')
      .exec();

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
    let lastShortCode = await this.getLastShortCodeCategory(createCategoryDto.companyId);
    createCategoryDto.shortCode = lastShortCode;
    const newProductCategory = new this.productCategoryModel(createCategoryDto);
    return newProductCategory.save();
  }

  async getLastShortCodeCategory(companyId: string): Promise<string | null> {
    const lastProductCategory = await this.productCategoryModel
      .findOne({ companyId })
      .sort({ shortCode: -1 })
      .select('shortCode')
      .exec();
    return lastProductCategory ? String(Number(lastProductCategory.shortCode) + 100) : "1000000";
  }

  async findProductCategorysByCompanyId(companyId: string, page: number = 1, limit: number = 10): Promise<{ totalRowCount: number, data: ProductCategory[] }> {
    const skip = (page - 1) * limit;
    let categories = await this.productCategoryModel.find({ companyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    if (categories.length === 0) {
      throw new NotFoundException(`Categories by companyId not found`);
    }
    const totalRowCount = await this.productCategoryModel.countDocuments({ companyId })
    return {
      totalRowCount: totalRowCount,
      data: categories as ProductCategory[]
    }
  }

  async findProductCategoriesFull(companyId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    let categories = await this.productCategoryModel.find({ companyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    let categoriesFull = [];
    for (let index = 0; index < categories.length; index++) {
      const category = categories[index];
      let subCat = await this.findProductSubCategorysByCategoryId(category._id.toString());
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
    createProductSubCategoryDto.categoryId = new Types.ObjectId(createProductSubCategoryDto.categoryId);
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
    let product = await this.productModel.findById(id, { name: 1 }).exec();
    return product.name;
  }

  async getNameTypeProductById(id: string): Promise<string> {
    let typeProduct = await this.typeProductModel.findById(id, { name: 1 }).exec();
    return typeProduct.name;
  }

}
