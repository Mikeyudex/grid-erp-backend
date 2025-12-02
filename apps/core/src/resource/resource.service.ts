import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ApiResponse } from '../common/api-response';
import { CreateResourceDto } from './resource.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from './resource.schema';

@Injectable()
export class ResourceService {

    constructor(
        @InjectModel(Resource.name) private readonly resourceModel: Model<ResourceDocument>,
    ) { }

    async getAll() {
        try {
            let resources = await this.resourceModel.find();
            return ApiResponse.success('Resource getAll successfully', resources, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getOne(id: string) {
        try {
            let resource = await this.resourceModel.findById(id).exec();
            return ApiResponse.success('Resource getOne successfully', resource, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async create(payload: CreateResourceDto) {
        try {
            let resource = new this.resourceModel(payload);
            await resource.save();
            return ApiResponse.success('Resource create successfully', resource, HttpStatus.CREATED);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }

    }

    update() {
        return ApiResponse.success('Resource update successfully', null);
    }

    async getResourceDefault() {
        try {
            let resource = await this.resourceModel.findOne({ name: 'home' });
            return resource.toObject();
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getFromPath(path: string) {
        try {
            const resource = await this.resourceModel.findOne({
                path: { $regex: `^${path}` },
            }).exec();
            return resource;
        } catch (error) {
            return null;
        }
    }
}
