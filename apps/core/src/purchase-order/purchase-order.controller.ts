import { Body, Controller, Post } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './purchase-order.dto';

@Controller('purchase-order')
export class PurchaseOrderController {
    constructor(private readonly purchaseOrderService: PurchaseOrderService) { }

    @Post()
    async create(@Body() dto: CreatePurchaseOrderDto) {
        return this.purchaseOrderService.create(dto);
    }
}
