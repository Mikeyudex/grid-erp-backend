import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Income, IncomeDocument, IncomeTypeOperation } from "../schemas/income.schema";
import { CreateIncomeDto } from "../dtos/income.dto";
import { PaginatedResponse } from "../../common/interfaces/paginated.interface";
import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { ApiResponse } from "../../common/api-response";
import { Debt, DebtDocument } from "../../debt/debt.schema";
import { DebtStatusEnum } from "../../debt/debt.enum";

interface GetIncomesParams {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export class IncomeService {

    private readonly logger = new Logger(IncomeService.name);

    constructor(
        @InjectModel(Income.name) private readonly incomeModel: Model<IncomeDocument>,
        @InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>,
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
                    { providerId: regex },
                    { accountId: regex },
                    { typeOperation: regex },
                    { purchaseOrderId: regex },
                    { description: regex },
                    { hasCurrentAdvancePayment: regex },
                ];
            }

            const totalItems = await this.incomeModel.countDocuments(filters);
            let incomes: any = await this.incomeModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('customerId', 'name lastname commercialName')
                .populate('providerId', 'name lastname commercialName')
                .populate('purchaseOrderId', '_id orderNumber')
                /* .populate('debtId', '_id name amountPayable status') */
                .populate('accountId', '_id name')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            // 🔹 Mapear deudas para cada income
            if (incomes.length > 0) {
                for (let income of incomes) {
                    if (income.debtIds && income.debtIds.length > 0) {
                        const debtsByIncome = await this.getDebtsByIncome(income.debtIds);
                        // Filtrar deudas nulas o inexistentes
                        income._doc.debts = debtsByIncome.filter(debt => debt !== null);
                    } else {
                        income._doc.debts = []; // si no tiene deudas
                    }
                }
            }

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
            console.log(error);
            throw new Error(`Error getting incomes: ${error.message}`);
        }
    }

    async findAllByCustomerAndTypeOperation(customerId: string, typeOperation: string, params: GetIncomesParams): Promise<PaginatedResponse<IncomeDocument>> {
        try {
            const { page, limit, sortBy = 'createdAt', sortOrder = 'asc' } = params;
            const filters: any = {};

            filters.customerId = new Types.ObjectId(customerId);
            filters.typeOperation = typeOperation;
            filters.hasCurrentAdvancePayment = true;

            const totalItems = await this.incomeModel.countDocuments(filters);

            let incomes: any = await this.incomeModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('customerId', 'name lastname commercialName')
                .populate('purchaseOrderId', '_id orderNumber')
                .populate('accountId', '_id name')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            if (incomes.length > 0) {
                for (let income of incomes) {
                    if (income.debtIds && income.debtIds.length > 0) {
                        const debtsByIncome = await this.getDebtsByIncome(income.debtIds);
                        // Filtrar deudas nulas o inexistentes
                        income._doc.debts = debtsByIncome.filter(debt => debt !== null);
                    } else {
                        income._doc.debts = []; // si no tiene deudas
                    }
                }
            }
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
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async findAllByProviderAndTypeOperation(providerId: string, typeOperation: string, params: GetIncomesParams): Promise<PaginatedResponse<IncomeDocument>> {
        try {
            const { page, limit, sortBy = 'createdAt', sortOrder = 'asc' } = params;
            const filters: any = {};

            filters.providerId = new Types.ObjectId(providerId);
            filters.typeOperation = typeOperation;
            filters.hasCurrentAdvancePayment = true;

            const totalItems = await this.incomeModel.countDocuments(filters);

            let incomes: any = await this.incomeModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('providerId', 'name lastname commercialName')
                .populate('accountId', '_id name')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            if (incomes.length > 0) {
                for (let income of incomes) {
                    if (income.debtIds && income.debtIds.length > 0) {
                        const debtsByIncome = await this.getDebtsByIncome(income.debtIds);
                        // Filtrar deudas nulas o inexistentes
                        income._doc.debts = debtsByIncome.filter(debt => debt !== null);
                    } else {
                        income._doc.debts = []; // si no tiene deudas
                    }
                }
            }

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
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
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
                .populate('providerId', 'name lastname commercialName')
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
            let totalDebts = 0;
            //Cruzar deudas si existen
            if (createIncomeDto?.debtIds && createIncomeDto.debtIds.length > 0) {
                for (let debtId of createIncomeDto.debtIds) {
                    let debtIdParsed = new Types.ObjectId(debtId);
                    let debt = await this.debtModel.findById(debtIdParsed);
                    if (debt) {
                        totalDebts += debt.amountPayable;
                        createIncomeDto.purchaseOrderId = debt.purchaseOrderId;
                        await this.crossDebt(debtIdParsed, createIncomeDto.value);
                    }
                }
                createIncomeDto.debtIds = (createIncomeDto.debtIds as string[]).map(
                    (debtId) => new Types.ObjectId(debtId)
                );
            }
            createIncomeDto.purchaseOrderId = new Types.ObjectId(createIncomeDto.purchaseOrderId);

            if (createIncomeDto.isInternalPayment) {
                createIncomeDto.providerId = new Types.ObjectId(createIncomeDto.providerId);
            } else {
                createIncomeDto.customerId = new Types.ObjectId(createIncomeDto.customerId);
            }
            createIncomeDto.accountId = new Types.ObjectId(createIncomeDto.accountId);

            let incomeDocument = await this.incomeModel.create(createIncomeDto);

            // si el total del pago es mayor a las deudas, crear anticipo
            if (totalDebts < createIncomeDto.value) {
                //Crear income como anticipo
                let saldo = createIncomeDto.value - totalDebts;
                createIncomeDto.typeOperation = IncomeTypeOperation.ANTICIPO;
                createIncomeDto.value = saldo;
                createIncomeDto.hasCurrentAdvancePayment = true;
                createIncomeDto.purchaseOrderId = null;
                createIncomeDto.observations = `Anticipo creado por saldo de pago de deudas pendientes. Total de deudas pagado: ${totalDebts}, saldo del pago: ${saldo}`;
                this.crearAnticipo(createIncomeDto)
                    .then(anticipo => {
                        this.logger.log(`Anticipo creado con éxito: ${anticipo.id}`);
                    })
                    .catch(error => {
                        throw new Error(`Error creando anticipo: ${error.message}`);
                    });
            }

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

    async crossDebt(debtId: Types.ObjectId, amount: number) {
        try {
            let debt = await this.debtModel.findOne({ _id: debtId, status: DebtStatusEnum.ABIERTO });
            if (!debt) return null;
            let balance = debt.amountPayable;
            if (amount >= balance) {
                debt.status = DebtStatusEnum.CERRADO;
                debt.amountPayable = 0;
            } else if (amount < balance) {
                debt.amountPayable = balance - amount;
            }
            const updatedDebt = await this.debtModel.findByIdAndUpdate(debtId, debt, { new: true });
            return updatedDebt;
        } catch (error) {
            throw new Error(`Error updating debt: ${error.message}`);
        }
    }

    async getDebtsByIncome(ids: Types.ObjectId[]) {
        try {
            let debts = await this.debtModel.find({ _id: { $in: ids } });
            return debts;
        } catch (error) {
            throw new Error(`Error getting debts by income: ${error.message}`);
        }
    }

    async crearAnticipo(createIncomeDto: CreateIncomeDto) {
        try {
            let anticipo = await this.incomeModel.create(createIncomeDto);
            return anticipo;
        } catch (error) {
            throw new Error(`Error creating anticipo: ${error.message}`);
        }
    }

}