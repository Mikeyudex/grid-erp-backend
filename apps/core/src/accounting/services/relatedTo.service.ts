import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RelatedTo, RelatedToDocument } from "../schemas/relatedTo.schema";
import { InternalServerErrorException } from "@nestjs/common";
import { ApiResponse } from "../../common/api-response";
import { CreateRelatedToDto, UpdateRelatedToDto } from "../dtos/relatedTo.dto";

export class RelatedToService {

    constructor(
        /*  @InjectModel(RelatedTo.name) private readonly relatedToModel: Model<RelatedToDocument>, */
    ) { }
    /* 
        async findAll() {
            try {
                let relatedTo = await this.relatedToModel.find().lean().exec();
                return ApiResponse.success('Registros obtenidos con éxito', relatedTo);
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
                let relatedTo = await this.relatedToModel.findById(castedId).lean().exec();
                return ApiResponse.success('Registros obtenidos con éxito', relatedTo);
            } catch (error) {
                throw new InternalServerErrorException({
                    statusCode: 500,
                    message: 'Error interno del servidor',
                    error: error.message || 'Unknown error',
                });
            }
        }
    
        async create(relatedTo: CreateRelatedToDto) {
            try {
                let relatedToDocument = await this.relatedToModel.create(relatedTo);
                return ApiResponse.success('Registros obtenidos con éxito', relatedToDocument);
            } catch (error) {
                throw new InternalServerErrorException({
                    statusCode: 500,
                    message: 'Error interno del servidor',
                    error: error.message || 'Unknown error',
                });
            }
        }
    
        async update(id: string, updateRelatedTo: UpdateRelatedToDto) {
            try {
                let castedId = new Types.ObjectId(id);
                let relatedTo = await this.relatedToModel.findByIdAndUpdate(castedId, updateRelatedTo, { new: true });
                return ApiResponse.success('Registros obtenidos con éxito', relatedTo);
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
                let relatedTo = await this.relatedToModel.findByIdAndDelete(castedId);
                return ApiResponse.success('Registros obtenidos con éxito', relatedTo);
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
                let relatedTo = await this.relatedToModel.deleteMany({ _id: { $in: idsObjectId } });
                return ApiResponse.success('Registros obtenidos con éxito', relatedTo);
            } catch (error) {
                throw new InternalServerErrorException({
                    statusCode: 500,
                    message: 'Error interno del servidor',
                    error: error.message || 'Unknown error',
                });
            }
        }
     */


}