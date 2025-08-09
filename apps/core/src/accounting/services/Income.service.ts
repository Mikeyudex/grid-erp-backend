import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Income, IncomeDocument } from "../schemas/income.schema";
import { CreateIncomeDto } from "../dtos/income.dto";
import { PaginatedResponse } from "../../common/interfaces/paginated.interface";
import { BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ApiResponse } from "../../common/api-response";

interface GetIncomesParams {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export class IncomeService {

    constructor(
        @InjectModel(Income.name) private readonly incomeModel: Model<IncomeDocument>,
    ) { }

    async findAll(params: GetIncomesParams): Promise<PaginatedResponse<IncomeDocument>> {
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

            const totalItems = await this.incomeModel.countDocuments(filters);
            let incomes = await this.incomeModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('customerId', 'name lastname commercialName')
                .populate('purchaseOrderId', '_id orderNumber')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: incomes,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
            }
        } catch (error) {
            throw new Error(`Error getting incomes: ${error.message}`);
        }
    }

    async findById(id: string): Promise<IncomeDocument> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            let income = await this.incomeModel.findById(castedId)
                .populate('customerId', 'name lastname commercialName')
                .populate('purchaseOrderId', '_id orderNumber')
                .exec();
            if (!income) {
                throw new NotFoundException({
                    statusCode: 404,
                    message: 'Income not found',
                    error: 'Not Found',
                });
            }
            return income;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new Error(`Error getting income: ${error.message}`);
        }
    }

    async create(createIncomeDto: CreateIncomeDto): Promise<IncomeDocument> {
        try {
            let incomeDocument = await this.incomeModel.create(createIncomeDto);
            return incomeDocument;
        } catch (error) {
            throw new Error(`Error creating income: ${error.message}`);
        }
    }

    async update(id: string, updateIncomeDto: any): Promise<IncomeDocument> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            const income = await this.incomeModel.findById(castedId);
            if (!income) {
                throw new NotFoundException({
                    statusCode: 404,
                    message: 'Income not found',
                    error: 'Not Found',
                });
            }
            let updatedIncome = await this.incomeModel.findByIdAndUpdate(castedId, updateIncomeDto, { new: true });
            return updatedIncome;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new Error(`Error updating income: ${error.message}`);
        }
    }

    async delete(id: string): Promise<IncomeDocument> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            const income = await this.incomeModel.findByIdAndDelete(castedId);
            if (!income) {
                throw new NotFoundException({
                    statusCode: 404,
                    message: 'Income not found',
                    error: 'Not Found',
                });
            }
            return income;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new Error(`Error deleting income: ${error.message}`);
        }
    }

    async bulkDelete(ids: string[]) {
        try {
            let idsObjectId = ids.map(id => new Types.ObjectId(id));
            let income = await this.incomeModel.deleteMany({ _id: { $in: idsObjectId } });
            return ApiResponse.success('Incomes eliminados con éxito', income);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async updatePurchaseOrderId(ids: Types.ObjectId[], purchaseOrderId: unknown) {
        try {
            let updated = await this.incomeModel.updateMany(
                { _id: { $in: ids } },
                { $set: { purchaseOrderId: purchaseOrderId } }
            );
            return updated;
        } catch (error) {
            throw new Error(`Error updating income: ${error.message}`);
        }
    }

}