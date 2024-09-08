// movement.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MovementService } from './movement.service';
import { CreateMovementDto } from './dto/movement.dto';
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

  @Get(':productId/stock')
  async getStock(@Param('productId') productId: string): Promise<number> {
    return this.movementService.calculateStock(productId);
  }
}
