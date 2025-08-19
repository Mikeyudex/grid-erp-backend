import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TypeOfExpense, TypeOfExpenseDocument } from "../schemas/type-of-expense.schema";
import { ApiResponse } from "../../common/api-response";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { CreateTypeOfExpenseDto, UpdateTypeOfExpenseDto } from "../dtos/type-of-expense.dto";

export class TypeOfExpenseService {

    constructor(
        @InjectModel(TypeOfExpense.name) private readonly typeOfExpenseModel: Model<TypeOfExpenseDocument>,
    ) { }

    async findAll() {
        try {
            let typeOfExpenses = await this.typeOfExpenseModel.find().lean().exec();
            return ApiResponse.success('Registros obtenidos con éxito', typeOfExpenses);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async findById(id: string) {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'id no es un ObjectId válido',
                });
            }
            let typeOfExpense = await this.typeOfExpenseModel.findById(castedId).lean().exec();
            return ApiResponse.success('Registros obtenidos con éxito', typeOfExpense);
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async create(createTypeOfExpenseDto: CreateTypeOfExpenseDto) {
        try {
            let typeOfExpenseDocument = await this.typeOfExpenseModel.create(createTypeOfExpenseDto);
            return ApiResponse.success('Registros obtenidos con éxito', typeOfExpenseDocument);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async update(id: string, updateTypeOfExpenseDto: UpdateTypeOfExpenseDto) {
        try {
            let castedId = new Types.ObjectId(id);
            let typeOfExpense = await this.typeOfExpenseModel.findByIdAndUpdate(castedId, updateTypeOfExpenseDto, { new: true });
            return ApiResponse.success('Registros obtenidos con éxito', typeOfExpense);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async delete(id: string) {
        try {
            let castedId = new Types.ObjectId(id);
            let typeOfExpense = await this.typeOfExpenseModel.findByIdAndDelete(castedId);
            return ApiResponse.success('Registros eliminados con éxito', typeOfExpense);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async bulkDelete(ids: string[]) {
        try {
            let idsObjectId = ids.map(id => new Types.ObjectId(id));
            let typeOfExpense = await this.typeOfExpenseModel.deleteMany({ _id: { $in: idsObjectId } });
            return ApiResponse.success('Registros eliminados con éxito', typeOfExpense);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

}