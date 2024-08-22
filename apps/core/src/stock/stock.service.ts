import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument } from './stock.schema';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(@InjectModel(Stock.name) private stockModel: Model<StockDocument>) {}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const newStock = new this.stockModel(createStockDto);
    return newStock.save();
  }

  async findAll(): Promise<Stock[]> {
    return this.stockModel.find().populate('productId').exec();
  }

  async findOne(id: string): Promise<Stock> {
    const stock = await this.stockModel.findById(id).populate('productId').exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto): Promise<Stock> {
    const updatedStock = await this.stockModel.findByIdAndUpdate(id, updateStockDto, { new: true }).exec();
    if (!updatedStock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return updatedStock;
  }

  async remove(id: string): Promise<Stock> {
    const deletedStock = await this.stockModel.findByIdAndDelete(id).exec();
    if (!deletedStock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return deletedStock;
  }
}
