import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Debt, DebtDocument } from './debt.schema';
import { ApiResponse } from '../common/api-response';
import { PaginatedResponse } from '../common/interfaces/paginated.interface'
import { CreateDebtDto, GetDebtsDto, UpdateDebtDto } from './debt.dto';

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
            const debt = new this.debtModel(createDebtDto);
            const createdDebt = await debt.save();
            return ApiResponse.success('Debt created', createdDebt);
        } catch (error) {
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