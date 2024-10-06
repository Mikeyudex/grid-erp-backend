// movement.controller.ts
import { Controller, Post, Body, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { MovementService } from './movement.service';
import { CreateMovementDto, ResponseTransferDto } from './dto/movement.dto';
import { Movement } from './movement.schema';

@Controller('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) { }

  @Get('getAll')
  async findAllTransfers(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('companyId') companyId: string,
    @Query('type') type: string,
  ): Promise<Movement[]> {
    return this.movementService.getAll(page, limit, companyId, type);
  }

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

  @Post('/create-transfer')
  async moveProductBetweenWarehouses(@Body() createMovementDto: CreateMovementDto): Promise<ResponseTransferDto> {
    return this.movementService.moveProductBetweenWarehouses(createMovementDto);
  }

}
