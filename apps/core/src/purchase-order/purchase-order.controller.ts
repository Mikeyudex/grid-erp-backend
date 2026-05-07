import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('purchase-order')
export class PurchaseOrderController {
    constructor(private readonly purchaseOrderService: PurchaseOrderService) { }

    @Post('create')
    async create(@Body() dto: CreatePurchaseOrderDto) {
        return this.purchaseOrderService.create(dto);
    }

    @Get('findAll')
    async findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('zoneId') zoneId: string) {
        if (!page || !limit) {
            throw new BadRequestException('Faltan parámetros');
        }
        if (page < 1 || limit < 1) {
            throw new BadRequestException('page y limit deben ser mayores a 1');
        }
        return this.purchaseOrderService.findAll(page, limit, zoneId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('findAllFreeOrders')
    async findAllFreeOrders(@Query('page') page: number, @Query('limit') limit: number) {
        if (!page || !limit) {
            throw new BadRequestException('Faltan parámetros');
        }
        if (page < 1 || limit < 1) {
            throw new BadRequestException('page y limit deben ser mayores a 1');
        }
        return this.purchaseOrderService.findAllFreeOrders(page, limit);
    }


    @Get('findAllFromViewProduction')
    async findAllFromViewProduction(@Query('page') page: number, @Query('limit') limit: number, @Query('zoneId') zoneId: string) {
        if (!page || !limit) {
            throw new BadRequestException('Faltan parámetros');
        }
        if (page < 1 || limit < 1) {
            throw new BadRequestException('page y limit deben ser mayores a 1');
        }
        return this.purchaseOrderService.findAllByViewProduction(page, limit, zoneId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('countOrdersByStatus')
    async countOrdersByStatus(@Query('status') status: string) {
        if (!status) {
            throw new BadRequestException('Falta el parámetro status');
        }
        return this.purchaseOrderService.countOrdersByStatus(status);
    }


    @Get('getById/:id')
    async getById(@Param('id') id: string) {
        return this.purchaseOrderService.getById(id);
    }

    @Get('getByOrderNumber/:orderNumber')
    async getByOrderNumber(@Param('orderNumber') orderNumber: string) {
        const num = parseInt(orderNumber, 10);
        if (isNaN(num)) {
            throw new BadRequestException('orderNumber debe ser un número válido');
        }
        return this.purchaseOrderService.getByOrderNumber(num);
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

    @UseGuards(JwtAuthGuard)
    @Put('release-order/:orderId/:userId')
    async releaseOrder(@Param('orderId') orderId: string, @Param('userId') userId: string) {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new BadRequestException('orderId no es un ObjectId válido');
        }
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('userId no es un ObjectId válido');
        }
        return this.purchaseOrderService.releaseOrder(orderId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('dispatch-order/:orderId/:userId')
    async dispatchOrder(@Param('orderId') orderId: string, @Param('userId') userId: string) {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new BadRequestException('orderId no es un ObjectId válido');
        }
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('userId no es un ObjectId válido');
        }
        return this.purchaseOrderService.dispatchOrder(orderId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('auto-assign-order/:orderId/:userId/:zoneId')
    async autoAssignOrder(@Param('orderId') orderId: string, @Param('userId') userId: string, @Param('zoneId') zoneId: string) {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new BadRequestException('orderId no es un ObjectId válido');
        }
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('userId no es un ObjectId válido');
        }
        if (!Types.ObjectId.isValid(zoneId)) {
            throw new BadRequestException('zoneId no es un ObjectId válido');
        }
        return this.purchaseOrderService.autoAssignOrder(orderId, userId, zoneId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete-order/:orderId')
    async deleteOrder(@Param('orderId') orderId: string) {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new BadRequestException('orderId no es un ObjectId válido');
        }
        return this.purchaseOrderService.deleteOrder(orderId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('bulk-delete')
    async bulkDeleteOrders(@Body() payload: Record<string, any>) {
        return this.purchaseOrderService.bulkDeleteOrders(payload?.ids);
    }
}
