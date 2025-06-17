import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    PurchaseOrder,
    PurchaseOrderDocument,
    PurchaseOrderItem,
    PurchaseOrderItemDocument,
} from './purchase-order.schema';
import { CreatePurchaseOrderDto } from './purchase-order.dto';
import { ApiResponse } from '../common/api-response';
import { PurchaseOrderDAO } from './purchase-order.dao';
import { ProductsService } from '../products/products.service';
import { PurchaseOrderActions } from './enums/purchase-order-actions.enum';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { UsersService } from '../users/users.service';
import { ItemStatusEnum } from './enums/itemStatus.enum';
import { PurchaseStatusEnum } from './enums/purchaseStatus.enum';

@Injectable()
export class PurchaseOrderService {
    logger = new Logger(PurchaseOrderService.name);

    constructor(
        @InjectModel(PurchaseOrder.name)
        private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
        @InjectModel(PurchaseOrderItem.name)
        private readonly purchaseOrderItemModel: Model<PurchaseOrderItemDocument>,
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

    async findAll(page: number, limit: number, zoneId: string) {
        try {
            let orders = await this.purchaseOrderDAO.findPaginated(page, limit, {
                status: {
                    $in: [PurchaseStatusEnum.ASIGNADO, PurchaseStatusEnum.FABRICACION]
                },
                zoneId: new Types.ObjectId(zoneId)
            });
            return ApiResponse.success('Ordenes obtenidas con éxito', orders);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    /**
   * Obtiene todas las ordenes de pedido desde la vista de producción.
   * @param page Número de página a mostrar
   * @param limit Cantidad de elementos por página
   */
    async findAllByViewProduction(page: number, limit: number, zoneId: string) {
        try {
            let filter = {
                $or: [
                    { zoneId: new Types.ObjectId(zoneId) },
                    { zoneId: null },
                    { zoneId: { $exists: false } }
                ]
            };
            let orders = await this.purchaseOrderDAO.findFromViewProduction(page, limit, filter, {});
            if (!orders || orders.length === 0) {
                throw new NotFoundException(`No se encontraron ordenes de pedido desde la vista de producción`);
            }
            let ordersNew = [];
            for (let index = 0; index < orders.length; index++) {
                let order: any = orders[index];
                const { clientId, details, ...restOrder } = order;
                let detailsNew = await this.constructDetails(details);
                ordersNew.push({
                    ...restOrder,
                    cliente: {
                        nombre: `${order.clientId?.name} ${order.clientId?.lastname}`,
                        email: order.clientId?.email,
                        empresa: order.clientId?.commercialName,
                        ciudad: order.clientId?.billingCity,
                        direccion: order.clientId?.billingAddress,
                    },
                    details: detailsNew,
                });
            }
            return ApiResponse.success('Ordenes obtenidas con éxito', ordersNew);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async constructDetails(details: any[]) {
        let detailsNew = [];
        for (let index = 0; index < details.length; index++) {
            try {
                let product: any = await this.productsService.findOne(details[index].productId);
                detailsNew.push({
                    ...details[index],
                    productName: product?.name,
                    marca: product.id_category?.name,
                    linea: product.id_sub_category?.name,
                });
            } catch (error) {
                console.log(error);
            }
        }
        return detailsNew;
    }

    /**
   * Obtiene una orden de pedido por su ID.
   * @param id ID de la orden de pedido
   */
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

    /**
   * Actualiza el estado de una orden de pedido.
   * @param orderId ID de la orden de pedido
   * @param status Estado de la orden (ej: "pendiente", "procesado", "cancelado")
   * @param userId ID del usuario que realiza la acción
   */
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
        // Obtener la orden completa para validaciones
        const order = await this.purchaseOrderModel.findById(orderId);

        if (!order) {
            throw new NotFoundException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Orden no encontrada',
            });
        }

        // Validar reglas por estado
        await this.validateOrderStatusTransition(order, status);


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

    /**
   * Asigna un item de una orden de pedido a un operador de producción.
   * @param orderId ID de la orden de pedido
   * @param itemId ID del item
   * @param operatorId ID del operador de producción
   */
    async assignItemToProductionOperator(orderId: string, itemId: string, operatorId: string) {
        try {
            await this.purchaseOrderModel.findByIdAndUpdate(
                orderId,
                {
                    $set: {
                        'details.$[item].assignedId': operatorId,
                        'details.$[item].itemStatus': ItemStatusEnum.FABRICATION,
                        'details.$[item].updatedAt': getCurrentUTCDate(),
                        'details.$[item].assignedAt': getCurrentUTCDate(),
                    },
                    status: ItemStatusEnum.FABRICATION,
                },
                { new: true, arrayFilters: [{ 'item._id': itemId }] },
            );

            this.usersService.findOne(operatorId)
                .then(operator => {
                    this.addHistoryEntry(orderId, `Item asignado a ${operator.name}`, operatorId);
                })
            return ApiResponse.success('Item asignado con éxito a operador de producción', null, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    /**
   * Actualiza el estado de un item de una orden de pedido.
   * @param orderId ID de la orden de pedido
   * @param itemId ID del item
   * @param userId ID del usuario que realiza la acción
   * @param status Estado del item (ej: "pendiente", "fabricacion", "inventario", "finalizado")
   */
    async updateItemStatus(orderId: string, itemId: string, userId: string, status: string) {
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


        function isValidItemStatus(status: string): status is ItemStatusEnum {
            return Object.values(ItemStatusEnum).includes(status as ItemStatusEnum);
        }

        if (!isValidItemStatus(status)) {
            throw new InternalServerErrorException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'status no es un ItemStatusEnum válido',
            });
        }
        const updatedOrder = await this.purchaseOrderModel.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    'details.$[item].updatedBy': userId,
                    'details.$[item].itemStatus': status,
                    'details.$[item].updatedAt': getCurrentUTCDate()
                },
            },
            { new: true, arrayFilters: [{ 'item._id': itemId }] }
        );

        if (updatedOrder) {
            await this.addHistoryEntry(orderId, `Estado actualizado a ${status}`, userId);
            // 🔍 Verificar si todos los items tienen el mismo estado
            const allStatusesEqual = updatedOrder.details.every(item => item.itemStatus === status);

            if (allStatusesEqual) {
                let newStatusOrder = null;
                if (status === ItemStatusEnum.FABRICATION) {
                    newStatusOrder = PurchaseStatusEnum.FABRICACION
                }

                switch (status) {
                    case ItemStatusEnum.FABRICATION:
                        newStatusOrder = PurchaseStatusEnum.FABRICACION;
                        break;
                    case ItemStatusEnum.FINISHED:
                        newStatusOrder = PurchaseStatusEnum.DESPACHADO;
                        break;
                    default:
                        newStatusOrder = PurchaseStatusEnum.ASIGNADO;
                        break;
                }
                // ✏️ Actualizar estado de la orden
                updatedOrder.status = newStatusOrder;
                await updatedOrder.save();

                await this.addHistoryEntry(orderId, `Estado de orden actualizado a ${newStatusOrder}.`, userId);
            }
        }
        return updatedOrder;
    }

    /**
   * Asigna una orden de pedido a una zona de producción.
   * @param orderId ID de la orden de pedido
   * @param zoneId ID de la zona de producción
   * @param userId ID del usuario que realiza la acción
   */
    async assignOrderToZone(orderId: string, zoneId: string, userId: string) {
        try {
            let selectedZone = await this.usersService.getZoneByIdInternal(zoneId);
            if (!selectedZone) {
                throw new NotFoundException(`No se encontró zona de producción con ID ${zoneId}`);
            }
            await this.purchaseOrderModel.findByIdAndUpdate(
                orderId,
                {
                    zoneId: new Types.ObjectId(zoneId),
                    status: PurchaseStatusEnum.ASIGNADO,
                    updatedAt: getCurrentUTCDate(),
                    updatedBy: new Types.ObjectId(userId),
                },
                { new: true },
            );

            this.addHistoryEntry(orderId, `Orden de pedido asignada a zona de producción ${selectedZone.name}`, userId);
            return ApiResponse.success('Orden de pedido asignada a zona de producción con éxito', null, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    private async validateOrderStatusTransition(order: PurchaseOrderDocument, newStatus: string) {

        switch (newStatus) {
            case PurchaseStatusEnum.DESPACHADO:
                const hasUnfinishedItems = order.details.some(
                    (item) => item.itemStatus !== ItemStatusEnum.FINISHED && item.itemStatus !== ItemStatusEnum.INVENTORY
                );

                if (hasUnfinishedItems) {
                    throw new BadRequestException({
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'No se puede despachar la orden: existen ítems no finalizados.',
                    });
                }
                break;
            // Puedes agregar más casos aquí en el futuro
            default:
                break;
        }
    }

    /**
     * Libera una orden de pedido.
     * @param orderId ID de la orden de pedido
     * @param userId ID del usuario que realiza la acción
     */
    async releaseOrder(orderId: string, userId: string) {
        try {
            let castedOrderId = new Types.ObjectId(orderId);
            await this.purchaseOrderModel.findByIdAndUpdate(
                castedOrderId,
                {
                    status: PurchaseStatusEnum.LIBRE,
                    updatedAt: getCurrentUTCDate(),
                    updatedBy: new Types.ObjectId(userId),
                    zoneId: null,
                },
                { new: true },
            );

            this.addHistoryEntry(orderId, `Orden de pedido liberada`, userId);
            return ApiResponse.success('Orden de pedido liberada con éxito', null, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    /**
     * Despachar una orden de pedido.
     * @param orderId ID de la orden de pedido
     * @param userId ID del usuario que realiza la acción
     */
    async dispatchOrder(orderId: string, userId: string) {
        try {
            let castedOrderId = new Types.ObjectId(orderId);
            let status = PurchaseStatusEnum.DESPACHADO;
            const order = await this.purchaseOrderModel.findById(castedOrderId);

            try {
                await this.validateOrderStatusTransition(order, status);
            } catch (error) {
                return ApiResponse.error(error.message, null, error.statusCode);
            }

            const updatedOrder = await this.purchaseOrderModel.findByIdAndUpdate(
                castedOrderId,
                { status, updatedBy: userId, updatedAt: getCurrentUTCDate() },
                { new: true }
            );

            if (updatedOrder) {
                await this.addHistoryEntry(orderId, `Estado actualizado a ${status}`, userId);
            }

            return ApiResponse.success('Orden de pedido despachada con éxito', updatedOrder, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}
