import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './purchase-order.dto';

@Controller('purchase-order')
export class PurchaseOrderController {
    constructor(private readonly purchaseOrderService: PurchaseOrderService) { }

    @Post('create')
    async create(@Body() dto: CreatePurchaseOrderDto) {
        return this.purchaseOrderService.create(dto);
    }

    @Get('findAll')
    async findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('fields') fields: string) {
        let fieldsArray = fields.split(',');
        return this.purchaseOrderService.findAll(page, limit, fieldsArray);
    }

    @Get('getById/:id')
    async getById(@Param('id') id: string) {
        return this.purchaseOrderService.getById(id);
    }

    @Put('update-order-status/:id/:userId')
    async updateOrderStatus(@Param('id') id: string, @Param('userId') userId: string, @Body() dto: { status: string }) {
        return this.purchaseOrderService.updateOrderStatus(id, dto.status, userId);
    }
}
