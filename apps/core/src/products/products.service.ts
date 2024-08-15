import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { AttributeConfig } from './attribute-config.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('AttributeConfig') private readonly attributeConfigModel: Model<AttributeConfig>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(createProductDto);
    return newProduct.save();
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

  async createAttributeConfig(name: string, type: string, options?: string[]): Promise<AttributeConfig> {
    const newAttributeConfig = new this.attributeConfigModel({ name, type, options });
    return newAttributeConfig.save();
  }
}
