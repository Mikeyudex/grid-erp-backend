import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    PurchaseOrder,
    PurchaseOrderDocument,
} from './purchase-order.schema';
import { CreatePurchaseOrderDto } from './purchase-order.dto';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class PurchaseOrderService {
    logger = new Logger(PurchaseOrderService.name);

    constructor(
        @InjectModel(PurchaseOrder.name)
        private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
    ) { }

    async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
        try {
            const createdOrder = new this.purchaseOrderModel(createPurchaseOrderDto);
            let order = await createdOrder.save();
            return ApiResponse.success('Orden creada con éxito', order, HttpStatus.CREATED);
        } catch (error) {
            this.logger.error('Error al crear cliente', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}
