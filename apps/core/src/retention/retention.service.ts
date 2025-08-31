import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Retention, RetentionDocument } from './retention.schema';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class RetentionService {
    constructor(
        @InjectModel(Retention.name)
        private readonly retentionModel: Model<RetentionDocument>
    ) { }


    async findAll(): Promise<ApiResponse<RetentionDocument[]>> {
        try {
            let retentions = await this.retentionModel.find().lean().exec();
            return ApiResponse.success('Registros obtenidos con éxito', retentions);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async findById(id: string): Promise<ApiResponse<RetentionDocument>> {
        try {
            let castedId = new Types.ObjectId(id);
            if (!Types.ObjectId.isValid(castedId)) {
                throw new Error('El id enviado no es válido');
            }
            let retention = await this.retentionModel.findById(castedId).lean().exec();
            return ApiResponse.success('Registros obtenidos con éxito', retention);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async create(retention: Retention): Promise<ApiResponse<RetentionDocument>> {
        try {
            let retentionDocument = await this.retentionModel.create(retention);
            return ApiResponse.success('Registros obtenidos con éxito', retentionDocument);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async update(id: string, retention: Retention): Promise<ApiResponse<RetentionDocument>> {
        try {
            let castedId = new Types.ObjectId(id);
            let retentionModel = await this.retentionModel.findByIdAndUpdate(castedId, retention, { new: true });
            return ApiResponse.success('Registros obtenidos con éxito', retentionModel);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async delete(id: string): Promise<ApiResponse<RetentionDocument>> {
        try {
            let castedId = new Types.ObjectId(id);
            let retentionModel = await this.retentionModel.findByIdAndDelete(castedId);
            return ApiResponse.success('Registros eliminados con éxito', retentionModel);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async bulkDelete(ids: string[]): Promise<ApiResponse<RetentionDocument>> {
        try {
            let idsObjectId = ids.map(id => new Types.ObjectId(id));
            await this.retentionModel.deleteMany({ _id: { $in: idsObjectId } });
            return ApiResponse.success('Registros eliminados con éxito', null);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }


}
