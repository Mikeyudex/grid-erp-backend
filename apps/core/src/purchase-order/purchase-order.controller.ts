import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Types } from 'mongoose';
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
    async findAll(@Query('page') page: number, @Query('limit') limit: number) {
        return this.purchaseOrderService.findAll(page, limit);
    }


    @Get('findAllFromViewProduction')
    async findAllFromViewProduction(@Query('page') page: number, @Query('limit') limit: number, @Query('zoneId') zoneId: string) {
        if(!page || !limit) {
            throw new BadRequestException('Faltan parámetros');
        }
        if(page < 1 || limit < 1) {
            throw new BadRequestException('page y limit deben ser mayores a 1');
        }
        return this.purchaseOrderService.findAllByViewProduction(page, limit, zoneId);
    }

    @Get('getById/:id')
    async getById(@Param('id') id: string) {
        return this.purchaseOrderService.getById(id);
    }

    @Put('update-order-status/:id/:userId')
    async updateOrderStatus(@Param('id') id: string, @Param('userId') userId: string, @Body() dto: { status: string }) {
        return this.purchaseOrderService.updateOrderStatus(id, dto.status, userId);
    }

    @Put('assign-item-to-production-operator/:orderId/:itemId/:userId')
    async assignItemToProductionOperator(@Param('orderId') orderId: string, @Param('itemId') itemId: string, @Param('userId') userId: string) {
        if (!orderId || !itemId || !userId) {
            throw new BadRequestException('Faltan parámetros');
        }
        if (!Types.ObjectId.isValid(orderId)) {
            throw new BadRequestException('orderId no es un ObjectId válido');
        }
        if (!Types.ObjectId.isValid(itemId)) {
            throw new BadRequestException('itemId no es un ObjectId válido');
        }
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('userId no es un ObjectId válido');
        }
        return this.purchaseOrderService.assignItemToProductionOperator(orderId, itemId, userId);
    }

    @Put('assign-order-to-zone/:orderId/:zoneId/:userId')
    async assignOrderToZone(@Param('orderId') orderId: string, @Param('zoneId') zoneId: string, @Param('userId') userId: string) {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new BadRequestException('orderId no es un ObjectId válido');
        }
        if (!Types.ObjectId.isValid(zoneId)) {
            throw new BadRequestException('zoneId no es un ObjectId válido');
        }
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('userId no es un ObjectId válido');
        }
        return this.purchaseOrderService.assignOrderToZone(orderId, zoneId, userId);
    }

    @Put('update-item-status/:orderId/:itemId/:userId')
    async updateItemStatus(@Param('orderId') orderId: string, @Param('itemId') itemId: string, @Param('userId') userId: string, @Body() dto: { status: string }) {
        return this.purchaseOrderService.updateItemStatus(orderId, itemId, userId, dto.status);
    }
}
