import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";
import { PaginatedResponse } from "../../common/interfaces/paginated.interface"
import { Expense, ExpenseDocument } from "../schemas/expense.schema"
import { BadRequestException, Logger, NotFoundException } from "@nestjs/common";
import { CreateExpenseDto } from "../dtos/expense.dto";
import { Debt, DebtDocument } from "../../debt/debt.schema";
import { DebtStatusEnum } from "../../debt/debt.enum";
import { Income, IncomeDocument, IncomeTypeOperation } from "../schemas/income.schema";
import { CreateIncomeDto } from "../dtos/income.dto";
import { DbErrorUtils } from "../../common/db/db-error-util";

interface GetExpensesParams {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export class ExpenseService {

    private readonly logger = new Logger(ExpenseService.name);

    constructor(
        @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
        @InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>,
        @InjectModel(Income.name) private readonly incomeModel: Model<IncomeDocument>,
    ) { }

    async findAll(params: GetExpensesParams): Promise<PaginatedResponse<ExpenseDocument>> {
        try {
            const { page, limit, search, sortBy = 'createdAt', sortOrder = 'asc' } = params;
            const filters: any = {};
            const orConditions: any[] = [];
            const isDate = (val: string) => !isNaN(Date.parse(val));

            if (search) {
                const parts = search.split(" ");

                let dateFrom: string | null = null;
                let dateTo: string | null = null;

                for (const part of parts) {
                    if (Types.ObjectId.isValid(part)) {
                        filters.providerId = new Types.ObjectId(part);
                        filters.accountId = new Types.ObjectId(part);
                        filters.zoneId = new Types.ObjectId(part);
                        filters.typeOfExpenseId = new Types.ObjectId(part);
                    } else if (isDate(part)) {
                        if (!dateFrom) {
                            dateFrom = part;
                        } else {
                            dateTo = part;
                        }
                    } else {
                        // Texto libre
                        const regex = new RegExp(part, 'i');
                        orConditions.push({ sequence: regex });
                    }
                }

                // aplicar rango de fechas si corresponde
                if (dateFrom && dateTo) {
                    filters.createdAt = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
                } else if (dateFrom) {
                    filters.createdAt = { $gte: new Date(dateFrom) };
                }

                // si hubo condiciones de texto, agregarlas al $or
                if (orConditions.length > 0) {
                    filters.$or = orConditions;
                }
            }

            const totalItems = await this.expenseModel.countDocuments(filters);
            let expenses: any = await this.expenseModel.find(filters)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('providerId', 'name lastname commercialName')
                .populate('accountId', '_id name')
                .populate('zoneId', 'name')
                .populate('typeOfExpenseId', 'name')
                .exec();

            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: expenses,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
            }
        } catch (error) {
            this.logger.error('Error al obtener los egresos', error?.message);
            throw new Error(`Error getting expenses: ${error.message}`);
        }
    }

    async findById(id: string): Promise<ExpenseDocument> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            let expense = await this.expenseModel.findById(castedId)
                .populate('providerId', 'name lastname commercialName')
                .populate('accountId', '_id name')
                .populate('zoneId', 'name')
                .populate('typeOfExpenseId', 'name')
                .exec();
            if (!expense) {
                throw new NotFoundException({
                    statusCode: 404,
                    message: 'Expense not found',
                    error: 'Not Found',
                });
            }
            return expense;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new Error(`Error getting expense: ${error.message}`);
        }
    }

    async create(createExpenseDto: CreateExpenseDto): Promise<ExpenseDocument> {
        const session: ClientSession = await this.expenseModel.db.startSession();
        session.startTransaction();

        try {
            let totalDebts = 0;

            //Cruzar deudas si existen
            if (createExpenseDto?.debtIds && createExpenseDto.debtIds.length > 0) {
                for (let debtId of createExpenseDto.debtIds) {
                    let debtIdParsed = new Types.ObjectId(debtId);
                    let debt = await this.debtModel.findById(debtIdParsed);
                    if (debt) {
                        totalDebts += debt.amountPayable;
                        await this.crossDebt(debtIdParsed, createExpenseDto.value);
                    }
                }
            }

            if (createExpenseDto.providerId) {
                createExpenseDto.providerId = new Types.ObjectId(createExpenseDto.providerId);
            }

            createExpenseDto.accountId = new Types.ObjectId(createExpenseDto.accountId);
            if (createExpenseDto.debtIds.length > 0) {
                createExpenseDto.debtIds = (createExpenseDto.debtIds as string[]).map(
                    (debtId) => new Types.ObjectId(debtId)
                );
            }

            let expenseDocument = await this.expenseModel.create(createExpenseDto);

            // si el total del pago es mayor a las deudas, crear anticipo
            if (totalDebts < createExpenseDto.value) {

                //Crear income como anticipo
                let saldo = createExpenseDto.value - totalDebts;
                createExpenseDto.value = saldo;
                createExpenseDto.hasCurrentAdvancePayment = true;
                createExpenseDto.observations = `Anticipo creado por saldo de pago de deudas pendientes con proveedor ${createExpenseDto.providerId}. Total de deudas pagado: ${totalDebts}, saldo del pago: ${saldo}`;

                //Crear anticipo
                let createIncomeDto: CreateIncomeDto = {
                    customerId: null,
                    providerId: createExpenseDto.providerId,
                    purchaseOrderId: null,
                    accountId: createExpenseDto.accountId,
                    debtIds: createExpenseDto.debtIds,
                    value: createExpenseDto.value,
                    observations: createExpenseDto.observations,
                    paymentSupport: createExpenseDto.paymentSupport,
                    hasCurrentAdvancePayment: createExpenseDto.hasCurrentAdvancePayment,
                    isInternalPayment: true,
                    typeOperation: IncomeTypeOperation.ANTICIPO,
                    paymentDate: createExpenseDto.paymentDate,
                };

                this.crearAnticipo(createIncomeDto)
                    .then(anticipo => {
                        this.logger.log(`Anticipo creado con éxito: ${anticipo.id}`);
                    })
                    .catch(error => {
                        throw new Error(`Error creando anticipo: ${error.message}`);
                    });
            }
            return expenseDocument;
        } catch (error) {
            this.logger.error('Error al crear el egreso', error);
            
            if (DbErrorUtils.isMongoConnectionError(error)) {
                this.logger.warn(`Error de conexión MongoDB: ${error.message}`);
                throw new Error(`No se pudo conectar a la base de datos. Por favor, intente nuevamente más tarde.`);
            }
            if (DbErrorUtils.isMongoValidationError(error)) {
                throw new Error(`Error de validación: ${DbErrorUtils.formatValidationError(error)}`);
            }
            await session.abortTransaction();
            throw new Error(`Error creating expense: ${error.message}`);
        } finally {
            session.endSession();
        }
    }


    async update(id: string, updateExpenseDto: any): Promise<ExpenseDocument> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            const expense = await this.expenseModel.findById(castedId);
            if (!expense) {
                throw new NotFoundException({
                    statusCode: 404,
                    message: 'Expense not found',
                    error: 'Not Found',
                });
            }
            let updatedExpense = await this.expenseModel.findByIdAndUpdate(castedId, updateExpenseDto, { new: true });
            return updatedExpense;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new Error(`Error updating expense: ${error.message}`);
        }
    }

    async delete(id: string): Promise<Expense> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'ID inválido',
                    error: 'El ID proporcionado no es válido',
                });
            }
            const expense = await this.expenseModel.findByIdAndDelete(castedId);
            if (!expense) {
                throw new NotFoundException({
                    statusCode: 404,
                    message: 'Expense not found',
                    error: 'Not Found',
                });
            }
            return expense;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new Error(`Error deleting expense: ${error.message}`);
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

    async crearAnticipo(createIncomeDto: CreateIncomeDto) {
        try {
            let anticipo = await this.incomeModel.create(createIncomeDto);
            return anticipo;
        } catch (error) {
            throw new Error(`Error creating anticipo: ${error.message}`);
        }
    }

}