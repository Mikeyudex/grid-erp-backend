// stock-adjustment.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StockAdjustmentService } from './stock-adjustment.service';
import { CreateStockAdjustmentDto } from './dto/stock-adjustment.dto';
import { StockAdjustment } from './stock-adjustment.schema';

@Controller('stock-adjustments')
export class StockAdjustmentController {
    companyId: string;
    constructor(private readonly stockAdjustmentService: StockAdjustmentService) {
        this.companyId = "3423f065-bb88-4cc5-b53a-63290b960c1a"
    }

    @Get('recent')
    async getRecentAdjustments(@Query('page') page: number, @Query('limit') limit: number) {
        return this.stockAdjustmentService.getRecentAdjustments(page, limit, this.companyId);
    }

    @Post('create')
    async createAdjustment(
        @Body() createStockAdjustmentDto: CreateStockAdjustmentDto,
    ): Promise<StockAdjustment> {
        return this.stockAdjustmentService.createStockAdjustment(createStockAdjustmentDto);
    }
}
