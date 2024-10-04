// movement.controller.ts
import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { MovementService } from './movement.service';
import { CreateMovementDto, ResponseTransferDto } from './dto/movement.dto';
import { Movement } from './movement.schema';

@Controller('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post('/create')
  async createMovement(@Body() createMovementDto: CreateMovementDto): Promise<Movement> {
    return this.movementService.create(createMovementDto);
  }

  @Get(':productId')
  async getMovementsByProduct(@Param('productId') productId: string): Promise<Movement[]> {
    return this.movementService.getMovementsByProduct(productId);
  }

  @Get('/all-transfers')
  async getAllTransfers(@Query('page') page: number, @Query('limit') limit: number, @Query('companyId') companyId: string): Promise<Movement[]> {
    return this.movementService.getAllTransfers(page, limit, companyId);
  } 

  @Get(':productId/stock')
  async getStock(@Param('productId') productId: string): Promise<number> {
    return this.movementService.calculateStock(productId);
  }

  @Post('/create-transfer')
  async moveProductBetweenWarehouses(@Body() createMovementDto: CreateMovementDto): Promise<ResponseTransferDto> {
    return this.movementService.moveProductBetweenWarehouses(createMovementDto);
  }
}
