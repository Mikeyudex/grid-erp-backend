import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TypeOfDocument, TypeOfDocumentDocument } from "../schemas/typeOfDocument.schema";
import { CreateTypeOfDocumentDto } from "../dtos/typeOfDocument.dto";
import { ApiResponse } from "../../common/api-response";
import { HttpStatus, InternalServerErrorException, Logger } from "@nestjs/common";


export class TypeOfDocumentService {

    logger = new Logger(TypeOfDocumentService.name);

    constructor(
        @InjectModel(TypeOfDocument.name) private readonly typeOfDocumentModel: Model<TypeOfDocumentDocument>
    ) { }

    async create(createTypeOfDocumentDto: CreateTypeOfDocumentDto) {
        try {
            let typeOfDocument = await this.typeOfDocumentModel.create(createTypeOfDocumentDto);
            return ApiResponse.success('Tipo de documento creado con éxito', typeOfDocument.toJSON(), HttpStatus.CREATED);
        } catch (error) {
            this.logger.error('Error al crear tipo de documento', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getAll() {
        try {
            let typeOfDocuments = await this.typeOfDocumentModel.find().lean().exec();
            return ApiResponse.success('Tipos de documento obtenidos con éxito', typeOfDocuments);
        } catch (error) {
            this.logger.error('Error al obtener tipos de documento', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getById(id: string) {
        try {
            let typeOfDocument = await this.typeOfDocumentModel.findById(id).lean().exec();
            return ApiResponse.success('Tipo de documento obtenido con éxito', typeOfDocument);
        } catch (error) {
            this.logger.error('Error al obtener tipo de documento', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async update(typeOfDocument: CreateTypeOfDocumentDto, id: string) {
        try {
            let typeOfDocumentDoc = await this.typeOfDocumentModel.findByIdAndUpdate(id, typeOfDocument, { new: true });
            return ApiResponse.success('Tipo de documento actualizado con éxito', typeOfDocumentDoc.toJSON());
        } catch (error) {
            this.logger.error('Error al actualizar tipo de documento', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async delete(id: string) {
        try {
            let typeOfDocument = await this.typeOfDocumentModel.findByIdAndDelete(id);
            return ApiResponse.success('Tipo de documento eliminado con éxito', typeOfDocument);
        } catch (error) {
            this.logger.error('Error al eliminar tipo de documento', error);
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
            let typeOfDocument = await this.typeOfDocumentModel.deleteMany({ _id: { $in: idsObjectId } });
            return ApiResponse.success('Tipos de documento eliminados con éxito', typeOfDocument);
        } catch (error) {
            this.logger.error('Error al eliminar tipos de documento', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}