import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
import { PaginatedResponse } from '../common/interfaces/paginated.interface';


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
  ) { this.companyId = "66becedd790bddbc9b1e2cbc" }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    createProductDto.uuid = v4();
    createProductDto.companyId = new Types.ObjectId("66becedd790bddbc9b1e2cbc");

    const session: ClientSession = await this.productModel.db.startSession();
    session.startTransaction();

    try {
      let unitOfMeasure = null;
      let tax = null;

      //find by id unitOfMeasure
      if (createProductDto.unitOfMeasureId) {
        unitOfMeasure = await this.unitOfMeasureService.findOne(createProductDto.unitOfMeasureId as string);
        if (!unitOfMeasure) {
          throw new NotFoundException({
            statusCode: 404,
            message: 'Unit of Measure not found',
            error: 'Not Found',
          });
        }
      }

      //find by id tax
      if (createProductDto.taxId) {
        tax = await this.taxesService.findOne(createProductDto.taxId as string);
        if (!tax) {
          throw new NotFoundException({
            statusCode: 404,
            message: 'Tax not found',
            error: 'Not Found',
          });
        }
      }

      const typeProduct = await this.getNameTypeProductById(createProductDto.id_type_product as string);
      if (!typeProduct) {
        throw new NotFoundException({
          statusCode: 404,
          message: 'TypeProduct not found',
          error: 'Not Found',
        });
      }

      const typeOfPiecesObjectId = createProductDto.typeOfPieces ? createProductDto.typeOfPieces.map(type => new Types.ObjectId(type)) : [];

      createProductDto.unitOfMeasureId = unitOfMeasure ? unitOfMeasure._id : null;

      if (!createProductDto.id_sub_category) {
        createProductDto.id_sub_category = new Types.ObjectId("680aaf320d033722d44d4bff");
      }

      if (!createProductDto.warehouseId) {
        createProductDto.warehouseId = new Types.ObjectId("66c2cbd4f171187740252cfc");
      }

      const newProduct = new this.productModel(createProductDto);
      newProduct.typeOfPieces = typeOfPiecesObjectId;
      newProduct.warehouseId = new Types.ObjectId(createProductDto.warehouseId);
      newProduct.historyActivityUserId = new Types.ObjectId(createProductDto.historyActivityUserId);

      const product = await newProduct.save();

      //Creando el stock para el produto recién creado
      const createStockDto: CreateStockDto = {
        productId: newProduct._id.toString(),
        quantity: createProductDto.quantity,
        warehouseId: createProductDto.warehouseId.toString(),
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

  async findAllByCompany(companyId: string, page: number = 1, limit: number = 10, search?: string): Promise<{ totalRowCount: number, data: GetAllByCompanyProductsResponseDto[] }> {

    const parsedLimit = Number(limit) || 10;
    const parsedPage = Number(page) || 1;
    const skip = (parsedPage - 1) * parsedLimit;
    const companyIdCasted = new Types.ObjectId(companyId);
    if (!Types.ObjectId.isValid(companyIdCasted)) {
      throw new BadRequestException(`Invalid ID: ${companyId}`);
    }

    let filter: any = { companyId: companyIdCasted };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');

      const matchedCategories = await this.productCategoryModel
        .find({
          companyId: companyIdCasted,
          name: regex
        })
        .select('_id')
        .lean();

      const categoryIds = matchedCategories.map((c: any) => c._id);

      filter.$or = [
        { name: regex },
        { id_category: { $in: categoryIds } }
      ];
    }

    const aggPipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'product-category',
          localField: 'id_category',
          foreignField: '_id',
          as: 'categoryDoc'
        }
      },
      { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
      { 
        $sort: { 
          'categoryDoc.name': 1, 
          name: 1 
        } 
      },
      { $skip: skip },
      { $limit: parsedLimit },
      { $project: { categoryDoc: 0 } }
    ];

    const [productsAgg, totalRowCount] = await Promise.all([
      this.productModel.aggregate(aggPipeline).collation({ locale: 'es', strength: 1 }),
      this.productModel.countDocuments(filter),
    ]);

    const products = await this.productModel.populate(productsAgg, [
      { path: 'id_category' },
      { path: 'id_sub_category' }
    ]);

    if (products.length === 0) {
      throw new NotFoundException(`Products by company not found`);
    }

    // Recolectar IDs únicos para batch queries
    const productIds = products.map((p: any) => p._id.toString());
    const warehouseIds = [...new Set(
      products.map((p: any) => p.warehouseId?.toString()).filter(Boolean)
    )];

    // Batch queries en paralelo: 1 query stocks + 1 query warehouses
    const [stockMap, warehouseResults] = await Promise.all([
      this.stockService.findManyByProductIds(productIds),
      warehouseIds.length > 0
        ? this.warehouseService.findManyByIds(warehouseIds)
        : Promise.resolve(new Map<string, any>()),
    ]);

    // Transformar con lookups en memoria (sin queries adicionales)
    const response = products.map((product: any) => {
      const warehouse = warehouseResults.get(product.warehouseId?.toString());
      const stockProduct = stockMap.get(product._id.toString());
      return {
        ...product,
        categoryName: product?.id_category?.name ?? 'No Definido',
        subCategoryName: product?.id_sub_category?.name ?? 'No Definido',
        warehouseName: warehouse?.name ?? 'No Definido',
        stock: stockProduct?.quantity ?? 0,
        attributes: product.attributes || {},
        additionalConfigs: product?.additionalConfigs || {},
      };
    });

    return {
      totalRowCount,
      data: response as GetAllByCompanyProductsResponseDto[],
    };
  }



  async findAllByCompanyLite(companyId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      let companyIdCasted = new Types.ObjectId(companyId);
      if (!Types.ObjectId.isValid(companyIdCasted)) {
        throw new BadRequestException(`Invalid ID: ${companyId}`);
      }
      let products = await this.productModel.find({ companyId: companyIdCasted })
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
    let _id = new Types.ObjectId(id);
    updateProductDto.id_category = new Types.ObjectId(updateProductDto.id_category);
    console.log(updateProductDto);

    const updatedProduct = await this.productModel.findByIdAndUpdate(_id, updateProductDto, { new: true }).exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async delete(id: string): Promise<Product> {
    let _id = new Types.ObjectId(id);
    const deletedProduct = await this.productModel.findByIdAndDelete(_id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return deletedProduct;
  }

  async bulkDelete(ids: string[]) {
    try {
      let idsObjectId = ids.map(id => new Types.ObjectId(id));
      let deletedProducts = await this.productModel.deleteMany({ _id: { $in: idsObjectId } });
      return deletedProducts;
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Error interno del servidor',
        error: error.message || 'Unknown error',
      });
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      let castedId = new Types.ObjectId(id);
      let product = await this.productModel.findById(castedId)
        .populate('id_category')
        .populate('id_type_product')
        .lean();

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Error interno del servidor',
        error: error.message || 'Unknown error',
      });
    }

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

  async getLastShortCodeCategory(companyId: string): Promise<string | null> {
    let companyIdCasted = new Types.ObjectId(companyId);
    if (!Types.ObjectId.isValid(companyIdCasted)) {
      throw new BadRequestException(`Invalid ID: ${companyId}`);
    }
    const lastProductCategory = await this.productCategoryModel
      .findOne({ companyId: companyIdCasted })
      .sort({ shortCode: -1 })
      .select('shortCode')
      .exec();
    return lastProductCategory ? String(Number(lastProductCategory.shortCode) + 100) : "1000000";
  }

  async findProductCategorysByCompanyId(companyId: string, page: number = 1, limit: number = 1000): Promise<{ totalRowCount: number, data: ProductCategory[] }> {
    let companyIdCasted = new Types.ObjectId(companyId);
    if (!Types.ObjectId.isValid(companyIdCasted)) {
      throw new BadRequestException(`Invalid ID: ${companyId}`);
    }
    const parsedLimit = Number(limit) || 1000;
    const parsedPage = Number(page) || 1;
    const skip = (parsedPage - 1) * parsedLimit;
    let categories = await this.productCategoryModel.find({ companyId: companyIdCasted })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
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

  async findProductCategoriesFull(companyId: string, page: number = 1, limit: number = 50): Promise<any> {
    let companyIdCasted = new Types.ObjectId(companyId);
    if (!Types.ObjectId.isValid(companyIdCasted)) {
      throw new BadRequestException(`Invalid ID: ${companyId}`);
    }
    const skip = (page - 1) * limit;

    let categories = await this.productCategoryModel.find({ companyId: companyIdCasted })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (categories.length === 0) {
      return [];
    }

    const categoryIds = categories.map(c => c._id);

    const subCategories = await this.productSubCategoryModel
      .find({ categoryId: { $in: categoryIds } })
      .lean()
      .exec();

    const subCategoriesMap = new Map<string, any[]>();
    for (const subCat of subCategories) {
      const catIdStr = subCat.categoryId.toString();
      if (!subCategoriesMap.has(catIdStr)) {
        subCategoriesMap.set(catIdStr, []);
      }
      subCategoriesMap.get(catIdStr)!.push(subCat);
    }

    return categories.map(category => ({
      ...category,
      subcategories: subCategoriesMap.get(category._id.toString()) || []
    }));
  }

  async findProductCategoriesFullSelect(companyId: string): Promise<any> {
    let companyIdCasted = new Types.ObjectId(companyId);
    if (!Types.ObjectId.isValid(companyIdCasted)) {
      throw new BadRequestException(`Invalid ID: ${companyId}`);
    }
    let categories = await this.productCategoryModel.find({ companyId: companyIdCasted }).lean();
    let categoriesFullSelect = [];
    for (let index = 0; index < categories.length; index++) {
      const category: ProductCategory = categories[index];
      let categorySelect = {
        label: category.name,
        value: category.uuid
      };
      /* let subCat = await this.findProductSubCategorysByCategoryId(category.uuid);
      let subcatSelect = subCat.map((subca: ProductSubCategory) => { return { label: subca.name, value: subca.uuid } })
      categoriesFullSelect.push(Object.assign({ ...categorySelect, subcategoriesSelect: subcatSelect })); */
      categoriesFullSelect.push(categorySelect);
    }
    return categoriesFullSelect;
  }

  async findProductCategoryByCompanyId(companyId: string): Promise<ProductCategory> {
    let companyIdCasted = new Types.ObjectId(companyId);
    if (!Types.ObjectId.isValid(companyIdCasted)) {
      throw new BadRequestException(`Invalid ID: ${companyId}`);
    }
    return this.productCategoryModel.findOne({ companyId: companyIdCasted }).exec();
  }

  async findProductCategoryByUuId(uuid: string): Promise<ProductCategory> {
    return this.productCategoryModel.findOne({ uuid }).exec();
  }

  async updateProductCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<ProductCategory> {
    let _id = new Types.ObjectId(id);
    const updatedProductCategory = await this.productCategoryModel.findByIdAndUpdate(_id, updateCategoryDto, { new: true }).exec();
    if (!updatedProductCategory) {
      throw new NotFoundException(`ProductCategory with ID ${id} not found`);
    }
    return updatedProductCategory;
  }

  async deleteProductCategory(id: string): Promise<ProductCategory> {
    let _id = new Types.ObjectId(id);
    const deletedProductCategory = await this.productCategoryModel.findByIdAndDelete(_id).exec();
    if (!deletedProductCategory) {
      throw new NotFoundException(`ProductCategory with ID ${id} not found`);
    }
    return deletedProductCategory;
  }

  async bulkDeleteProductCategory(ids: string[]) {
    try {
      let idsObjectId = ids.map(id => new Types.ObjectId(id));
      let deletedProductCategory = await this.productCategoryModel.deleteMany({ _id: { $in: idsObjectId } });
      return deletedProductCategory;
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Error interno del servidor',
        error: error.message || 'Unknown error',
      });
    }
  }

  async createProductSubCategory(createProductSubCategoryDto: CreateProductSubCategoryDto): Promise<ProductSubCategory> {
    createProductSubCategoryDto.uuid = v4();
    createProductSubCategoryDto.categoryId = new Types.ObjectId(createProductSubCategoryDto.categoryId);
    const newProductSubCategory = new this.productSubCategoryModel(createProductSubCategoryDto);
    return newProductSubCategory.save();
  }

  async findProductSubCategorysByCategoryId(categoryId: string): Promise<ProductSubCategory[]> {
    let categoryIdCasted = new Types.ObjectId(categoryId);
    if (!Types.ObjectId.isValid(categoryIdCasted)) {
      throw new BadRequestException(`Invalid ID: ${categoryId}`);
    }
    return this.productSubCategoryModel.find({ categoryId: categoryIdCasted }).exec();
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
    let companyIdCasted = new Types.ObjectId(companyId);
    if (!Types.ObjectId.isValid(companyIdCasted)) {
      throw new BadRequestException(`Invalid ID: ${companyId}`);
    }
    const lastProduct = await this.productModel
      .findOne({ companyId: companyIdCasted })  // Filtrar por companyId
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
    let castedId = new Types.ObjectId(id);
    if (!Types.ObjectId.isValid(castedId)) {
      throw new NotFoundException(`Invalid ID: ${id}`);
    }
    let typeProduct = await this.typeProductModel.findById(castedId, { name: 1 }).exec();
    return typeProduct.name;
  }

  async searchProduct(typeProduct: string, search: string): Promise<PaginatedResponse<ProductDocument>> {
    let typeProductDocument = await this.typeProductModel.findOne({ name: new RegExp(typeProduct, 'i') })
      .lean()
      .exec();
    if (!typeProductDocument) {
      throw new NotFoundException(`TypeProduct not found`);
    }
    const filters: any = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filters.$or = [
        { name: regex },
        { description: regex },
        { sku: regex },
      ];
    }

    filters.id_type_product = typeProductDocument._id;

    const totalItems = await this.productModel.countDocuments(filters);

    let products = await this.productModel.find(filters)
      .sort({ createdAt: -1 })
      .populate('id_category', 'name')
      .populate('warehouseId', 'name')
      .populate('id_type_product', 'name')
      .populate('taxId', 'name, percentage')
      .exec();

    const totalPages = Math.ceil(totalItems / 10);

    let productsMap = [];

    for (let index = 0; index < products.length; index++) {
      const product: any = products[index];
      let stockProduct = await this.stockService.findOneByProductId(product._id.toString());
      productsMap.push({
        ...product.toObject(),
        stock: stockProduct?.quantity ?? 0,
      })
    }

    return {
      data: productsMap as ProductDocument[],
      meta: {
        currentPage: 1,
        totalPages,
        totalItems,
        itemsPerPage: 10,
      },
    }

  }

  /**
   * Construye un RegExp que ignora acentos/diacríticos además de mayúsculas.
   * Ej: "baul" matchea "BAÚL", "tercel" matchea "TERCEL SD (1997)".
   */
  private buildAccentInsensitiveRegex(term: string): RegExp {
    const map: Record<string, string> = {
      a: '[aáàäâã]', e: '[eéèëê]', i: '[iíìïî]',
      o: '[oóòöôõ]', u: '[uúùüû]', n: '[nñ]',
      A: '[AÁÀÄÂÃaáàäâã]', E: '[EÉÈËÊeéèëê]', I: '[IÍÌÏÎiíìïî]',
      O: '[OÓÒÖÔÕoóòöôõ]', U: '[UÚÙÜÛuúùüû]', N: '[NÑnñ]',
    };
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escapar chars especiales regex
    const pattern = escaped.replace(/[aeiounAEIOUN]/g, (ch) => map[ch] ?? ch);
    return new RegExp(pattern, 'i');
  }

  async searchProductByFullText(
    search?: string,
    typeProduct?: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ProductDocument>> {
    try {
      const filtersBase: any = {};

      // 1️⃣ Filtrar por tipo de producto si llega — fallo suave si no existe
      if (typeProduct) {
        const typeProductDoc = await this.typeProductModel
          .findOne({ name: new RegExp(typeProduct.trim(), 'i') })
          .lean();

        if (typeProductDoc) {
          filtersBase.id_type_product = typeProductDoc._id;
        }
        // Si no se encuentra el tipo, se omite el filtro para no devolver vacío
      }

      // 2️⃣ Inicializamos filtro final
      let finalFilter: any = { ...filtersBase };

      // 3️⃣ Si hay texto de búsqueda → construir búsqueda insensible a acentos y mayúsculas
      if (search && search.trim() !== '') {
        const accentRegex = this.buildAccentInsensitiveRegex(search.trim());

        // A) Buscar por nombre del producto
        const productQuery: any = {
          ...filtersBase,
          name: accentRegex,
        };

        // B) Buscar marcas (categorías) que coincidan
        const matchedCategories = await this.productCategoryModel
          .find({ name: accentRegex })
          .select('_id')
          .lean();

        const categoryIds = matchedCategories.map(c => c._id);

        // C) OR: nombre o categoría
        finalFilter = {
          ...filtersBase,
          $or: [
            productQuery,
            ...(categoryIds.length > 0 ? [{ id_category: { $in: categoryIds } }] : []),
          ],
        };
      }

      // 5️⃣ Paginación
      const totalItems = await this.productModel.countDocuments(finalFilter);
      const parsedLimit = Number(limit) || 10;
      const parsedPage = Number(page) || 1;
      const skip = (parsedPage - 1) * parsedLimit;

      const aggPipeline: any[] = [
        { $match: finalFilter },
        {
          $lookup: {
            from: 'product-category',
            localField: 'id_category',
            foreignField: '_id',
            as: 'categoryDoc'
          }
        },
        { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
        { 
          $sort: { 
            name: 1, 
            'categoryDoc.name': 1 
          } 
        },
        { $skip: skip },
        { $limit: parsedLimit },
        { $project: { categoryDoc: 0 } }
      ];

      const productsAgg = await this.productModel.aggregate(aggPipeline).collation({ locale: 'es', strength: 1 });

      const products = await this.productModel.populate(productsAgg, [
        { path: 'id_category', select: 'name' },
        { path: 'warehouseId', select: 'name' },
        { path: 'id_type_product', select: 'name' },
        { path: 'taxId', select: 'name percentage' },
        { path: 'typeOfPieces', select: 'name' }
      ]);

      // 6️⃣ Añadir stock
      const productsWithStock = await Promise.all(
        products.map(async (product) => {
          const stockProduct = await this.stockService.findOneByProductId(product._id.toString());
          return {
            ...product,
            stock: stockProduct?.quantity ?? 0,
          };
        })
      );

      return {
        data: productsWithStock as unknown as ProductDocument[],
        meta: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: limit,
        },
      };

    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Error interno del servidor',
        error: error.message || 'Unknown error',
      });
    }
  }

}
