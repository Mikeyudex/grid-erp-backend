import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import {  UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './stock.schema';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  async create(@Body() createStockDto: CreateStockDto): Promise<Stock> {
    return this.stockService.create(createStockDto);
  }

  @Get()
  async findAll(): Promise<Stock[]> {
    return this.stockService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Stock> {
    return this.stockService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto): Promise<Stock> {
    return this.stockService.update(id, updateStockDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Stock> {
    return this.stockService.remove(id);
  }
}
