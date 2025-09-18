import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from "mongoose";
import { Purchase, PurchaseDocument } from './purchase.schema';
import { PaginatedResponse } from '../common/interfaces/paginated.interface';
import { CreatePurchaseDetailDto, CreatePurchaseDto, UpdatePurchaseDto } from './purchase.dto';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { Tax, TaxDocument } from '../taxes/taxes.schema';
import { Retention, RetentionDocument } from '../retention/retention.schema';
import { CreateIncomeDto } from '../accounting/dtos/income.dto';
import { Income, IncomeDocument, IncomeTypeOperation } from '../accounting/schemas/income.schema';
import { IncomeService } from '../accounting/services/Income.service';
import { ApiResponse } from '../common/api-response';
import { CreateDebtDto } from '../debt/debt.dto';
import { DebtStatusEnum } from '../debt/debt.enum';
import { Debt, DebtDocument } from '../debt/debt.schema';
import * as moment from "moment";

interface GetPurchaseParams {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

@Injectable()
export class PurchaseService {
    logger = new Logger(PurchaseService.name);

    constructor(
        @InjectModel(Purchase.name) private readonly purchaseModel: Model<PurchaseDocument>,
        @InjectModel(Tax.name) private readonly taxModel: Model<TaxDocument>,
        @InjectModel(Retention.name) private readonly retentionModel: Model<RetentionDocument>,
        @InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>,
        @InjectModel(Income.name) private readonly incomeModel: Model<IncomeDocument>,
        private readonly incomeService: IncomeService,
    ) { }

    async findAll(params: GetPurchaseParams): Promise<PaginatedResponse<PurchaseDocument>> {
        try {
            const { page, limit, search, sortBy = 'createdAt', sortOrder = 'asc' } = params;
            const filters: any = {};

            // Búsqueda general (en varias propiedades)
            if (search) {
                const regex = new RegExp(search, 'i');
                filters.$or = [
                    { providerId: regex },
                    { supplierInvoiceNumber: regex },
                ];
            }

            const totalItems = await this.purchaseModel.countDocuments(filters);
            let purchases = await this.purchaseModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('providerId', 'name lastname commercialName')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: purchases,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
            }
        } catch (error) {
            throw new Error(`Error getting purchases: ${error.message}`);
        }
    }

    async findAllByProvider(providerId: string, params: GetPurchaseParams): Promise<PaginatedResponse<PurchaseDocument>> {
        try {
            const { page, limit, sortBy = 'createdAt', sortOrder = 'asc' } = params;
            const filters: any = {};

            filters.providerId = new Types.ObjectId(providerId);

            const totalItems = await this.purchaseModel.countDocuments(filters);

            let purchases = await this.purchaseModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('providerId', 'name lastname commercialName')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: purchases,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
            }
        } catch (error) {
            throw new Error(`Error getting purchases: ${error.message}`);
        }
    }

    async findById(id: string): Promise<PurchaseDocument> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new Error('Invalid ID');
            }
            let purchase = await this.purchaseModel.findById(castedId)
                .populate('providerId', 'name lastname commercialName')
                .exec();
            if (!purchase) {
                throw new Error('Purchase not found');
            }
            return purchase;
        } catch (error) {
            throw new Error(`Error getting purchase: ${error.message}`);
        }
    }

    async create(createPurchaseDto: CreatePurchaseDto): Promise<ApiResponse<PurchaseDocument>> {
        const session: ClientSession = await this.purchaseModel.db.startSession();
        session.startTransaction();
        try {
            let incomeIds = [];
            let methodOfPayments: CreateIncomeDto[] = [];

            for (let index = 0; index < createPurchaseDto.methodOfPayment.length; index++) {
                let methodOfPaymentDto = createPurchaseDto.methodOfPayment[index];

                if (
                    methodOfPaymentDto.typeOperation === IncomeTypeOperation.RECEIPTS
                    || methodOfPaymentDto.typeOperation === IncomeTypeOperation.SALES
                    || methodOfPaymentDto.typeOperation === IncomeTypeOperation.COMPRAS
                ) {
                    methodOfPaymentDto.providerId = new Types.ObjectId(methodOfPaymentDto.customerId);
                    methodOfPaymentDto.accountId = new Types.ObjectId(methodOfPaymentDto.accountId);
                    methodOfPaymentDto.hasCurrentAdvancePayment = false;
                    let incomeDocument = await this.incomeService.create(methodOfPaymentDto);
                    incomeIds.push(incomeDocument._id);
                    methodOfPaymentDto.incomeId = incomeDocument._id.toString();
                }
                methodOfPayments.push(methodOfPaymentDto);
            }

            delete createPurchaseDto.methodOfPayment;
            createPurchaseDto.providerId = new Types.ObjectId(createPurchaseDto.providerId);
            createPurchaseDto.zoneId = new Types.ObjectId(createPurchaseDto.zoneId);

            for (let detail of createPurchaseDto.detail) {
                detail.createdBy = new Types.ObjectId(detail.createdBy);
                detail.productId = new Types.ObjectId(detail.productId);
                detail.taxId = new Types.ObjectId(detail.taxId);
                detail.retentionId = new Types.ObjectId(detail.retentionId);
                detail.itemTotal = await this.calculateTotalItem(detail);
            }

            //createPurchaseDto.totalOrder = this.calculateTotalPurchase(createPurchaseDto);
            let purchaseDocument = new this.purchaseModel(createPurchaseDto);
            purchaseDocument.methodOfPayment = incomeIds;

            let order = await purchaseDocument.save();

            await this.createDebt(order, methodOfPayments, true);
            await this.crossAdvancePayment(order, methodOfPayments);
            await this.incomeService.updatePurchaseOrderId(incomeIds, purchaseDocument._id);
            return ApiResponse.success('Orden de compra creada con éxito', order, HttpStatus.CREATED);
        } catch (error) {
            this.logger.error('Error al crear orden de compra', error);
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

    async calculateTotalItem(purchaseDetail: CreatePurchaseDetailDto): Promise<number> {
        try {

            if (isNaN(purchaseDetail.itemPrice) || isNaN(purchaseDetail.itemQuantity)) {
                throw new Error('Item price or quantity is not a number');
            }

            if (purchaseDetail.itemPrice < 0 || purchaseDetail.itemQuantity < 0) {
                throw new Error('Item price or quantity is negative');
            }

            let taxPercentage = await this.taxModel.findById(new Types.ObjectId(purchaseDetail.taxId))
                .select('percentage')
                .exec();

            let retentionPercentage = await this.retentionModel.findById(new Types.ObjectId(purchaseDetail.retentionId))
                .select('percentage')
                .exec();

            if (!taxPercentage || !retentionPercentage) {
                throw new Error('Tax or Retention not found');
            }

            if (isNaN(taxPercentage.percentage) || isNaN(retentionPercentage.percentage)) {
                throw new Error('Tax or Retention percentage is not a number');
            }

            if (taxPercentage.percentage < 0 || retentionPercentage.percentage < 0) {
                throw new Error('Tax or Retention percentage is negative');
            }

            //Vlr. Unitario - descuento x Cantidad + IVA – Retención
            let total = purchaseDetail.itemPrice * purchaseDetail.itemQuantity * (100 - purchaseDetail.discountPercentage) / 100;
            total = total + (total * taxPercentage.percentage / 100) - (total * retentionPercentage.percentage / 100);
            return total;

        } catch (error) {
            throw new Error(`Error calculating total: ${error.message}`);
        }
    }

    calculateTotalPurchase(purchase: PurchaseDocument | CreatePurchaseDto): number {
        let total = 0;
        for (let detail of purchase.detail) {
            total += detail.itemTotal;
        }
        return total;
    }

    async update(id: string, updatePurchaseDto: UpdatePurchaseDto): Promise<PurchaseDocument> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new Error('Invalid ID');
            }
            const purchase = await this.purchaseModel.findById(castedId);
            if (!purchase) {
                throw new Error('Purchase not found');
            }
            updatePurchaseDto.updatedAt = getCurrentUTCDate();
            if (updatePurchaseDto.providerId) {
                updatePurchaseDto.providerId = new Types.ObjectId(updatePurchaseDto.providerId);
            }
            let updatedPurchase = await this.purchaseModel.findByIdAndUpdate(castedId, updatePurchaseDto, { new: true });
            return updatedPurchase;
        } catch (error) {
            throw new Error(`Error updating purchase: ${error.message}`);
        }
    }

    async delete(id: string): Promise<PurchaseDocument> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new Error('Invalid ID');
            }
            const purchase = await this.purchaseModel.findByIdAndDelete(castedId);
            if (!purchase) {
                throw new Error('Purchase not found');
            }
            return purchase;
        } catch (error) {
            throw new Error(`Error deleting purchase: ${error.message}`);
        }
    }

    async bulkDelete(ids: string[]) {
        try {
            let idsObjectId = ids.map(id => new Types.ObjectId(id));
            let purchase = await this.purchaseModel.deleteMany({ _id: { $in: idsObjectId } });
            return purchase;
        } catch (error) {
            throw new Error(`Error deleting purchase: ${error.message}`);
        }
    }

    async  createDebt(order: PurchaseDocument, methodOfPayments: CreateIncomeDto[], isInternalDebt: boolean) {
        try {
            let value = 0;
            for (let index = 0; index < methodOfPayments.length; index++) {
                const methodOfPayment = methodOfPayments[index];
                let typeOperation = methodOfPayment.typeOperation;
                if (typeOperation === IncomeTypeOperation.CREDITO) {
                    value = value + methodOfPayment.value;
                    // Crear el registro de la deuda, cuando es una deuda interna se guardar el id de la zona como customerId
                    const debt: CreateDebtDto = {
                        customerId: order.zoneId,
                        providerId: order.providerId,
                        purchaseOrderId: order._id as Types.ObjectId,
                        description: `Deuda interna de $${order.totalOrder} por Compra #${order.orderNumber}`,
                        amountPayable: value,
                        status: DebtStatusEnum.ABIERTO,
                        isInternalDebt: isInternalDebt,
                        dueDate: moment(methodOfPayment.paymentDate, "YYYY-MM-DD").toDate(),
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

    async crossAdvancePayment(order: PurchaseDocument, methodOfPayments: CreateIncomeDto[]) {
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
}
