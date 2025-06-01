import { Model, Types } from 'mongoose';
import { CreateTypeOfCustomerDto } from "../dtos/typeOfCustomer.dto";
import { TypeOfCustomer, TypeOfCustomerDocument } from "../schemas/typeOfCustomer.schema";
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse } from '../../common/api-response';
import { HttpStatus, InternalServerErrorException, Logger } from '@nestjs/common';


export class TypeOfCustomerService {

    logger = new Logger(TypeOfCustomerService.name);

    constructor(
        @InjectModel(TypeOfCustomer.name) private readonly typeOfCustomerModel: Model<TypeOfCustomerDocument>
    ) { }

    async create(typeOfCustomer: CreateTypeOfCustomerDto) {
        try {
            let typeOfCustomerDoc = await this.typeOfCustomerModel.create(typeOfCustomer);
            return ApiResponse.success('Tipo de cliente creado con éxito', typeOfCustomerDoc.toJSON(), HttpStatus.CREATED);
        } catch (error) {
            this.logger.error('Error al crear tipo de cliente', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getAll() {
        try {
            let customers = await this.typeOfCustomerModel.find().lean().exec();
            return ApiResponse.success('Tipos de cliente obtenidos con éxito', customers);
        } catch (error) {
            this.logger.error('Error al obtener tipos de cliente', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getById(id: string) {
        try {
            let castedId = new Types.ObjectId(id);
            let typeOfCustomer = await this.typeOfCustomerModel.findById(castedId).lean().exec();
            return ApiResponse.success('Tipo de cliente obtenido con éxito', typeOfCustomer);
        } catch (error) {
            this.logger.error('Error al obtener tipo de cliente', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async update(typeOfCustomer: CreateTypeOfCustomerDto, id: string) {
        try {
            let castedId = new Types.ObjectId(id);
            let typeOfCustomerDoc = await this.typeOfCustomerModel.findByIdAndUpdate(castedId, typeOfCustomer, { new: true });
            return ApiResponse.success('Tipo de cliente actualizado con éxito', typeOfCustomerDoc.toJSON());
        } catch (error) {
            this.logger.error('Error al actualizar tipo de cliente', error);
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
            let typeOfCustomer = await this.typeOfCustomerModel.findByIdAndDelete(castedId);
            return ApiResponse.success('Tipo de cliente eliminado con éxito', typeOfCustomer);
        } catch (error) {
            this.logger.error('Error al eliminar tipo de cliente', error);
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
            let typeOfCustomer = await this.typeOfCustomerModel.deleteMany({ _id: { $in: idsObjectId } });
            return ApiResponse.success('Tipos de cliente eliminados con éxito', typeOfCustomer);
        } catch (error) {
            this.logger.error('Error al eliminar tipos de cliente', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

}