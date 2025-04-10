import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    PurchaseOrder,
    PurchaseOrderDocument,
} from './purchase-order.schema';
import { CreatePurchaseOrderDto } from './purchase-order.dto';
import { ApiResponse } from '../common/api-response';
import { PurchaseOrderDAO } from './purchase-order.dao';
import { ProductsService } from '../products/products.service';
import { PurchaseOrderActions } from './enums/purchase-order-actions.enum';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { UsersService } from '../users/users.service';

@Injectable()
export class PurchaseOrderService {
    logger = new Logger(PurchaseOrderService.name);

    constructor(
        @InjectModel(PurchaseOrder.name)
        private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
        private readonly purchaseOrderDAO: PurchaseOrderDAO,
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService,
    ) { }

    async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
        try {
            const createdOrder = new this.purchaseOrderModel({
                ...createPurchaseOrderDto,
                history: [
                    {
                        action: PurchaseOrderActions.CREATED,
                        userId: new Types.ObjectId(createPurchaseOrderDto.createdBy),
                        createdAt: getCurrentUTCDate(),
                    },
                ]
            });
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

    async findAll(page: number, limit: number, fields: string[]) {
        try {
            let orders = await this.purchaseOrderDAO.findPaginatedByFields(page, limit, fields);
            return ApiResponse.success('Ordenes obtenidas con éxito', orders);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getById(id: string) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new InternalServerErrorException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'id no es un ObjectId válido',
                });
            }
            let orderIdCasted = new Types.ObjectId(id);
            let order = await this.purchaseOrderModel.findById(orderIdCasted).populate('clientId').lean();
            let detailsNew = [];
            let historyNew = [];
            for (let index = 0; index < order.details.length; index++) {
                let product = await this.productsService.findOne(order.details[index].productId);
                detailsNew.push({
                    ...order.details[index],
                    productName: product.name,
                });
            }
            for (let index = 0; index < order.history.length; index++) {
                let userId = new Types.ObjectId(order.history[index].userId);
                let user = await this.usersService.findOne(userId);
                historyNew.push({
                    ...order.history[index],
                    userName: user.name + ' ' + user.lastname,
                });
            }
            order.details = detailsNew;
            order.history = historyNew;
            return ApiResponse.success('Orden obtenida con éxito', order);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    /**
   * Añade una entrada al historial de una orden de pedido.
   * @param orderId ID de la orden de pedido
   * @param action Descripción de la acción (ej: "Orden creada", "Estado actualizado")
   * @param userId ID del usuario que realiza la acción
   */
    async addHistoryEntry(
        orderId: Types.ObjectId | string,
        action: string,
        userId: Types.ObjectId | string,
    ): Promise<void> {
        await this.purchaseOrderModel.findByIdAndUpdate(
            orderId,
            {
                $push: {
                    history: {
                        action,
                        userId: new Types.ObjectId(userId),
                        createdAt: new Date(), // Si usas getCurrentUTCDate() también lo puedes usar aquí
                    },
                },
            },
            { new: true },
        );
    }

    async updateOrderStatus(orderId: string, status: string, userId: string) {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new InternalServerErrorException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'orderId no es un ObjectId válido',
            });
        }

        if (!Types.ObjectId.isValid(userId)) {
            throw new InternalServerErrorException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'userId no es un ObjectId válido',
            });
        }
        const updatedOrder = await this.purchaseOrderModel.findByIdAndUpdate(
            orderId,
            { status, updatedBy: userId, updatedAt: getCurrentUTCDate() },
            { new: true }
        );

        if (updatedOrder) {
            await this.addHistoryEntry(orderId, `Estado actualizado a ${status}`, userId);
        }

        return updatedOrder;
    }
}
