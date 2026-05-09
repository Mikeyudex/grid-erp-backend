import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from "moment";
import { ClientSession, Model, Types } from 'mongoose';
import {
    PurchaseOrder,
    PurchaseOrderDocument,
    PurchaseOrderItem,
    PurchaseOrderItemDocument,
} from './purchase-order.schema';
import { CreatePurchaseOrderDto, CreatePurchaseOrderItemDto } from './purchase-order.dto';
import { ApiResponse } from '../common/api-response';
import { PurchaseOrderDAO } from './purchase-order.dao';
import { ProductsService } from '../products/products.service';
import { PurchaseOrderActions } from './enums/purchase-order-actions.enum';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { UsersService } from '../users/users.service';
import { ItemStatusEnum } from './enums/itemStatus.enum';
import { PurchaseStatusEnum } from './enums/purchaseStatus.enum';
import { IncomeService } from '../accounting/services/Income.service';
import { Account, AccountDocument } from '../accounting/schemas/account.schema';
import { CreateDebtDto } from '../debt/debt.dto';
import { CreateIncomeDto } from '../accounting/dtos/income.dto';
import { DebtStatusEnum } from '../debt/debt.enum';
import { Income, IncomeDocument, IncomeTypeOperation } from '../accounting/schemas/income.schema';
import { Debt, DebtDocument } from '../debt/debt.schema';


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
        private readonly incomeService: IncomeService,
        @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
        @InjectModel(Income.name) private readonly incomeModel: Model<IncomeDocument>,
        @InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>,
    ) { }

    async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
        const session: ClientSession = await this.purchaseOrderModel.db.startSession();
        session.startTransaction();

        try {
            let incomeIds = [];
            let methodOfPayments: CreateIncomeDto[] = [];

            for (let index = 0; index < createPurchaseOrderDto.methodOfPayment.length; index++) {
                let methodOfPaymentDto = createPurchaseOrderDto.methodOfPayment[index];

                // Normalizar IDs
                if (methodOfPaymentDto.customerId) {
                    methodOfPaymentDto.customerId = new Types.ObjectId(methodOfPaymentDto.customerId);
                }
                if (methodOfPaymentDto.accountId) {
                    methodOfPaymentDto.accountId = new Types.ObjectId(methodOfPaymentDto.accountId);
                }

                // 1) Intentar buscar una cuenta bancaria con ese id
                let account = await this.accountModel.findById(methodOfPaymentDto.accountId).lean().catch(() => null);

                // 2) Si NO existe una cuenta, intentar buscar un anticipo (advance) con ese id
                let advance = null;
                if (!account) {
                    // Asumo que tienes un servicio para anticipos. Si el nombre es distinto, ajusta.
                    advance = await this.incomeModel.findById(methodOfPaymentDto.accountId.toString()).catch(() => null);
                }

                // 3) Determinar el tipo de operación
                let operationType: IncomeTypeOperation;
                if (advance) {
                    // Si se encontró un anticipo, es ANTICIPO
                    operationType = IncomeTypeOperation.ANTICIPO;
                } else if (account) {
                    // Si existe cuenta bancaria, resolver según su tipo (CRÉDITO / EFECTIVO / AHORROS ...)
                    operationType = this.resolveOperationTypeFromAccount(account);
                } else {
                    // Ni cuenta ni anticipo: lanzar error para evitar estados inconsistentes
                    throw new NotFoundException(`Cuenta o anticipo con id ${methodOfPaymentDto.accountId} no encontrado`);
                }

                // 4) Asignar typeOperation internamente
                methodOfPaymentDto.typeOperation = operationType;

                // 5) Flag que usan otras funciones (por ejemplo crossAdvancePayment)
                methodOfPaymentDto.hasCurrentAdvancePayment = (operationType === IncomeTypeOperation.ANTICIPO);

                // 6) Crear Income si aplica
                if ([
                    IncomeTypeOperation.SALES,
                    IncomeTypeOperation.RECEIPTS
                ].includes(operationType)) {
                    methodOfPaymentDto.customerId = new Types.ObjectId(methodOfPaymentDto.customerId);
                    methodOfPaymentDto.accountId = new Types.ObjectId(methodOfPaymentDto.accountId);
                    methodOfPaymentDto.hasCurrentAdvancePayment = false;
                    let incomeDocument = await this.incomeService.create(methodOfPaymentDto);
                    incomeIds.push(incomeDocument._id);
                    methodOfPaymentDto.incomeId = incomeDocument._id.toString();
                }

                // 7) Añadir al array local para posteriores procesos (deuda, cruce, etc.)
                methodOfPayments.push(methodOfPaymentDto);
            }

            delete createPurchaseOrderDto.methodOfPayment;

            createPurchaseOrderDto.clientId = new Types.ObjectId(createPurchaseOrderDto.clientId);
            createPurchaseOrderDto.zoneId = new Types.ObjectId(createPurchaseOrderDto.zoneId);
            createPurchaseOrderDto.createdBy = new Types.ObjectId(createPurchaseOrderDto.createdBy);

            // Convertir productId a ObjectId
            createPurchaseOrderDto.details = createPurchaseOrderDto.details.map(detail => ({
                ...detail,
                productId: new Types.ObjectId(detail.productId),
            }));

            // Expandir items según quantityItem
            createPurchaseOrderDto.details = this.expandDetails(createPurchaseOrderDto.details);

            // Recalcular contador de items
            createPurchaseOrderDto.itemsQuantity = createPurchaseOrderDto.details.length;

            // Recalcular total de la orden
            createPurchaseOrderDto.totalOrder = createPurchaseOrderDto.details
                .reduce((acc, item) => acc + item.totalItem, 0);

            const createdOrder = new this.purchaseOrderModel({
                ...createPurchaseOrderDto,
                history: [
                    {
                        action: PurchaseOrderActions.CREATED,
                        userId: new Types.ObjectId(createPurchaseOrderDto.createdBy),
                        createdAt: getCurrentUTCDate(),
                    },
                ],
                methodOfPayment: incomeIds,
            });
            let order = await createdOrder.save();
            await this.createDebt(order, methodOfPayments, false);
            await this.crossAdvancePayment(order, methodOfPayments);
            await this.incomeService.updatePurchaseOrderId(incomeIds, order._id);
            return ApiResponse.success('Orden creada con éxito', order, HttpStatus.CREATED);
        } catch (error) {
            this.logger.error('Error al crear orden de pedido', error);
            await session.abortTransaction();
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        } finally {
            session.endSession();
        }

    }

    async createDebt(order: PurchaseOrderDocument, methodOfPayments: CreateIncomeDto[], isInternalDebt: boolean) {
        try {
            let value = 0;
            for (let index = 0; index < methodOfPayments.length; index++) {
                const methodOfPayment = methodOfPayments[index];
                let typeOperation = methodOfPayment.typeOperation;
                if (typeOperation === IncomeTypeOperation.CREDITO) {
                    value = value + methodOfPayment.value;
                    // Crear el registro de la deuda
                    const debt: CreateDebtDto = {
                        customerId: order.clientId,
                        providerId: null,
                        purchaseOrderId: order._id as Types.ObjectId,
                        description: `Deuda de $${order.totalOrder} por Pedido #${order.orderNumber}`,
                        amountPayable: value,
                        status: DebtStatusEnum.ABIERTO,
                        isInternalDebt: isInternalDebt,
                        dueDate: moment(methodOfPayment.paymentDate).toISOString(),
                    };

                    let debtDocument = new this.debtModel(debt);
                    await debtDocument.save();
                    await this.incomeModel.updateOne(
                        { _id: methodOfPayment.incomeId },
                        {
                            $set: {
                                debtId: debtDocument._id,
                                updatedAt: getCurrentUTCDate()
                            }
                        }
                    )
                }
            }
        } catch (error: any) {
            console.log(error);
            throw new Error(`Error al crear la deuda: ${error?.message}`);
        }
    }

    async crossAdvancePayment(order: PurchaseOrderDocument, methodOfPayments: CreateIncomeDto[]) {
        try {
            for (let index = 0; index < methodOfPayments.length; index++) {
                const methodOfPayment = methodOfPayments[index];
                let typeOperation = methodOfPayment.typeOperation;
                if (typeOperation === IncomeTypeOperation.ANTICIPO) {
                    try {
                        let incomeId = methodOfPayment.accountId;
                        await this.incomeModel.findByIdAndUpdate(incomeId, {
                            hasCurrentAdvancePayment: false,
                            updatedAt: getCurrentUTCDate(),
                            purchaseOrderId: order._id
                        })
                    } catch (error) {
                        this.logger.error('Error al cruzar el anticipo', error);
                    }
                }
            }
        } catch (error) {
            console.log(error);
            throw new Error(`Error al cruzar el anticipo: ${error?.message}`);
        }
    }

    async getNameAccount(id: string) {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new Error('id no es un ObjectId válido');
            }
            let account = await this.accountModel.findOne(castedId).exec();
            if (!account) {
                throw new NotFoundException(`No se encontró la cuenta con ID ${id}`);
            }
            return account.name;
        } catch (error) {
            throw new Error(`Error al obtener el nombre de la cuenta: ${error.message}`);
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

    async findAllFreeOrders(page: number, limit: number) {
        try {
            let orders = await this.purchaseOrderDAO.findPaginated(page, limit, {
                status: PurchaseStatusEnum.LIBRE,
                /* zoneId: null, */
            });
            if (!orders || orders.length === 0) {
                throw new NotFoundException(`No se encontraron ordenes de pedido libres`);
            }
            return ApiResponse.success('Ordenes libres obtenidas con éxito', orders);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async countOrdersByStatus(status: string) {
        try {
            let countOrders = await this.purchaseOrderDAO.countByStatus(status);
            return ApiResponse.success('Ordenes obtenidas con éxito', countOrders);
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
                ],
                status: {
                    $in: [
                        PurchaseStatusEnum.ASIGNADO,
                        PurchaseStatusEnum.FABRICACION,
                        PurchaseStatusEnum.LIBRE,
                    ],
                },
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
                        ciudad: order.clientId?.city,
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
            let order = await this.purchaseOrderModel
                .findById(orderIdCasted)
                .populate('clientId')
                .populate({ path: 'zoneId', select: 'name' })
                .populate({ path: 'createdBy', select: 'name lastname' })
                .populate({ path: 'methodOfPayment', populate: { path: 'accountId', select: 'name' } })
                .lean();
            const collapsedDetails = this.compactDetails(order.details);
            order.details = (await Promise.all(
                collapsedDetails.map(async (detail) => {
                    const product = await this.productsService.findOne(detail.productId);
                    return { ...detail, productName: product?.name ?? 'Producto eliminado' };
                })
            )) as any;
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

    /**
     * Autoasigna una orden de pedido.
     * @param orderId ID de la orden de pedido
     * @param userId ID del usuario que realiza la acción
     * @param zoneId ID de la zona al que se le asigna la orden
     */
    async autoAssignOrder(orderId: string, userId: string, zoneId: string) {
        try {
            let castedOrderId = new Types.ObjectId(orderId);
            let castedZoneId = new Types.ObjectId(zoneId);
            let status = PurchaseStatusEnum.ASIGNADO;
            const order = await this.purchaseOrderModel.findById(castedOrderId);

            try {
                await this.validateOrderStatusTransition(order, status);
            } catch (error) {
                return ApiResponse.error(error.message, null, error.statusCode);
            }

            const updatedOrder = await this.purchaseOrderModel.findByIdAndUpdate(
                castedOrderId,
                {
                    status,
                    zoneId: castedZoneId,
                    updatedBy: userId,
                    updatedAt: getCurrentUTCDate(),
                },
                { new: true }
            );

            if (updatedOrder) {
                await this.addHistoryEntry(orderId, `Estado actualizado a ${status}`, userId);
            }

            return ApiResponse.success('Orden de pedido autoasignada con éxito', updatedOrder, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    /**
     * Elimina una orden de pedido.
     * @param orderId ID de la orden de pedido
     */
    async deleteOrder(orderId: string) {
        try {
            let castedOrderId = new Types.ObjectId(orderId);
            let deletedOrder = await this.purchaseOrderModel.findByIdAndDelete(castedOrderId).exec();
            return ApiResponse.success('Orden de pedido eliminada con éxito', deletedOrder, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }


    /**
     * Elimina ordenes de pedido.
     * @param ids IDs de las ordenes de pedido
     */
    async bulkDeleteOrders(ids: string[]) {
        try {
            let idsObjectId = ids.map(id => new Types.ObjectId(id));
            let deletedOrders = await this.purchaseOrderModel.deleteMany({ _id: { $in: idsObjectId } });
            return ApiResponse.success('Ordenes de pedido eliminadas con éxito', deletedOrders, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    /**
    * Duplica los items según quantityItem para procesarlos individualmente.
    */
    public expandDetails(details: CreatePurchaseOrderItemDto[]): CreatePurchaseOrderItemDto[] {
        const expanded: CreatePurchaseOrderItemDto[] = [];

        for (const item of details) {
            const repeat = item.quantityItem || 1;

            for (let i = 0; i < repeat; i++) {
                const newItem = {
                    ...item,
                    _id: undefined,
                    quantityItem: 1,
                    totalItem: item.priceItem,
                    assignedId: null,
                    assignedAt: null,
                    updatedAt: null
                };

                expanded.push(newItem);
            }
        }

        return expanded;
    }

    /**
    * Compacta los items expandidos, agrupándolos por mismas características
    * para volver a tener quantityItem > 1.
    */
    public compactDetails(expanded: CreatePurchaseOrderItemDto[]): CreatePurchaseOrderItemDto[] {
        const groups = new Map<string, CreatePurchaseOrderItemDto>();

        for (const item of expanded) {
            // Crear clave única por producto + tipo de tapete + material + piezas
            const key = [
                item.productId.toString(),
                item.matType,
                item.materialType,
                item.pieces,
                JSON.stringify(item.piecesNames),
                item.priceItem
            ].join("|");

            if (!groups.has(key)) {
                groups.set(key, {
                    ...item,
                    quantityItem: 1,
                    totalItem: item.priceItem,
                });
            } else {
                const group = groups.get(key);
                group.quantityItem += 1;
                group.totalItem = group.quantityItem * group.priceItem;
            }
        }

        return Array.from(groups.values());
    }

    private resolveOperationTypeFromAccount(account: any): IncomeTypeOperation {
        if (!account) return IncomeTypeOperation.SALES;

        const typeAccount = (account.typeAccount || "").toString().toUpperCase();
        const bankAccount = (account.bankAccount || "").toString().toUpperCase();

        // Cuentas de crédito
        if (typeAccount === 'CRÉDITO' || bankAccount === 'CXC' || bankAccount === 'CXC') {
            return IncomeTypeOperation.CREDITO;
        }

        // Efectivo / cuentas corrientes / ahorros => ventas/recibos
        if (['EFECTIVO', 'AHORROS', 'CORRIENTE'].includes(typeAccount)) {
            return IncomeTypeOperation.SALES;
        }

        // Default
        return IncomeTypeOperation.SALES;
    }

    async getByOrderNumber(orderNumber: number) {
        try {
            let order = await this.purchaseOrderModel
                .findOne({ orderNumber })
                .populate('clientId')
                .populate({ path: 'zoneId', select: 'name' })
                .populate({ path: 'createdBy', select: 'name lastname' })
                .populate({ path: 'methodOfPayment', populate: { path: 'accountId', select: 'name' } })
                .lean();
            if (!order) {
                throw new NotFoundException({
                    statusCode: 404,
                    message: `Orden #${orderNumber} no encontrada`,
                });
            }
            const collapsedDetails = this.compactDetails(order.details);
            order.details = (await Promise.all(
                collapsedDetails.map(async (detail) => {
                    const product = await this.productsService.findOne(detail.productId);
                    return { ...detail, productName: product?.name ?? 'Producto eliminado' };
                })
            )) as any;
            return ApiResponse.success('Orden obtenida con éxito', order);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}
