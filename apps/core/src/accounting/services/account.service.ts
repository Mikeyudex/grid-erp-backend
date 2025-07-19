import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Account, AccountDocument } from "../schemas/account.schema";
import { ApiResponse } from "../../common/api-response";
import { InternalServerErrorException } from "@nestjs/common";
import { CreateAccountDto, UpdateAccountDto } from "../dtos/account.dto";

export class AccountService {

    constructor(
        @InjectModel(Account.name) private readonly accounModel: Model<AccountDocument>,
    ) { }

    async findAll() {
        try {
            let accounts = await this.accounModel.find().exec();
            return ApiResponse.success('Registros obtenidos con éxito', accounts);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async findOne(id: string) {
        try {
            let castedId = new Types.ObjectId(id);
            let account = await this.accounModel.findById(castedId).exec();
            return ApiResponse.success('Registro obtenido con éxito', account);
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
            let account = await this.accounModel.findById(castedId).exec();
            return ApiResponse.success('Registro obtenido con éxito', account);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async create(account: CreateAccountDto) {
        try {
            let created = await this.accounModel.create(account);
            return ApiResponse.success('Registro creado con éxito', created);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async update(id: string, account: UpdateAccountDto) {
        try {
            let castedId = new Types.ObjectId(id);
            let updated = await this.accounModel.findByIdAndUpdate(castedId, account, { new: true }).exec();
            return ApiResponse.success('Registro actualizado con éxito', updated);
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
            let deleted = await this.accounModel.findByIdAndDelete(castedId).exec();
            return ApiResponse.success('Registro eliminado con éxito', deleted);
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
            let deletedAccounts = await this.accounModel.deleteMany({ _id: { $in: idsObjectId } });
            return ApiResponse.success('Registros eliminados con éxito', deletedAccounts);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

}