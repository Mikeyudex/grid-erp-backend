import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Debt, DebtDocument } from './debt.schema';
import { ApiResponse } from '../common/api-response';
import { PaginatedResponse } from '../common/interfaces/paginated.interface'
import { CreateDebtDto, GetDebtsDto, UpdateDebtDto } from './debt.dto';
import { DebtStatusEnum } from './debt.enum';

interface GetDebtsParams {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}


@Injectable()
export class DebtService {
    constructor(@InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>) { }

    async getDebts(params: GetDebtsParams): Promise<PaginatedResponse<DebtDocument>> {
        try {
            const { page, limit, search, sortBy = 'createdAt', sortOrder = 'asc' } = params;
            const filters: any = {};

            // Búsqueda general (en varias propiedades)
            if (search) {
                const regex = new RegExp(search, 'i');
                filters.$or = [
                    { customerId: regex },
                    { purchaseOrderId: regex },
                    { description: regex },
                ];
            }

            const totalItems = await this.debtModel.countDocuments(filters);
            let debts = await this.debtModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('customerId', 'name')
                .populate('purchaseOrderId', '_id purchaseOrderNumber')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: debts,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
            }
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getDebtsByCustomer(customerId: string, params: GetDebtsParams, status: string): Promise<PaginatedResponse<DebtDocument>> {
        try {
            const { page, limit, sortBy = 'createdAt', sortOrder = 'asc' } = params;

            let castedId = new Types.ObjectId(customerId);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            const filters: any = {};

            if (status) {
                filters.customerId = castedId;
                filters.status = status;
            } else {
                filters.customerId = castedId;
            }
            const totalItems = await this.debtModel.countDocuments(filters);

            let debts = await this.debtModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('customerId', 'name')
                .populate('purchaseOrderId', '_id purchaseOrderNumber')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: debts,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
            }
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getDebtsByProvider(providerId: string, customerId: string, params: GetDebtsParams, status: string): Promise<PaginatedResponse<DebtDocument>> {
        try {
            const { page, limit, sortBy = 'createdAt', sortOrder = 'asc' } = params;

            let customerIdCasted = new Types.ObjectId(customerId);
            let providerIdCasted = new Types.ObjectId(providerId);
            if (!Types.ObjectId.isValid(customerIdCasted)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            if (!Types.ObjectId.isValid(providerIdCasted)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }

            const filters: any = {};

            if (status) {
                filters.customerId = customerIdCasted;
                filters.providerId = providerIdCasted;
                filters.status = status;
            } else {
                filters.customerId = customerIdCasted;
                filters.providerId = providerIdCasted;
            }
            const totalItems = await this.debtModel.countDocuments(filters);

            let debts = await this.debtModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('providerId', 'name')
                .populate('purchaseOrderId', '_id purchaseOrderNumber')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: debts,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
            }
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getDebtById(id: string): Promise<ApiResponse<DebtDocument>> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            const debt = await this.debtModel.findById(id)
                .populate('customerId', 'name')
                .populate('purchaseOrderId', '_id purchaseOrderNumber')
                .exec();
            if (!debt) {
                throw new NotFoundException('Debt not found');
            }
            return ApiResponse.success('Deuda obtenida', debt);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async createDebt(createDebtDto: CreateDebtDto): Promise<ApiResponse<DebtDocument>> {
        try {
            createDebtDto.customerId = new Types.ObjectId(createDebtDto.customerId);
            createDebtDto.purchaseOrderId = new Types.ObjectId(createDebtDto.purchaseOrderId);
            const debt = new this.debtModel(createDebtDto);
            const createdDebt = await debt.save();
            return ApiResponse.success('Debt created', createdDebt);
        } catch (error) {
            console.log(error);
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async updateDebt(id: string, updateDebtDto: UpdateDebtDto): Promise<ApiResponse<DebtDocument>> {
        try {
            const castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            const debt = await this.debtModel.findById(castedId);
            if (!debt) {
                throw new NotFoundException('Debt not found');
            }
            debt.description = updateDebtDto.description;
            debt.amountPayable = updateDebtDto.amountPayable;
            const updatedDebt = await debt.save();
            return ApiResponse.success('Debt updated', updatedDebt);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async deleteDebt(id: string): Promise<ApiResponse<DebtDocument>> {
        try {
            const castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            const debt = await this.debtModel.findByIdAndDelete(castedId);
            if (!debt) {
                throw new NotFoundException('Debt not found');
            }
            return ApiResponse.success('Debt deleted', debt);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}