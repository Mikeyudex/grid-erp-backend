import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AddResourceDto, CreateRoleUserDto } from './role-user.dto';
import { ApiResponse } from '../common/api-response';
import { RoleUser, RoleUserDocument } from './role-user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ResourceService } from '../resource/resource.service';


@Injectable()
export class RoleUserService {

    constructor(
        @InjectModel(RoleUser.name) private readonly roleUserModel: Model<RoleUserDocument>,
        private readonly resourceService: ResourceService,
    ) { }

    async create(payload: CreateRoleUserDto) {
        try {
            if (!payload.resources || payload.resources.length === 0) {
                payload.resources = [(await this.resourceService.getResourceDefault())._id.toString()];
            }
            let roleUser = new this.roleUserModel(payload);
            await roleUser.save();
            return ApiResponse.success('Rol creado correctamente', roleUser, HttpStatus.CREATED);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    update(payload: CreateRoleUserDto) {
        return ApiResponse.success('RoleUser updated successfully', null);
    }

    async getAll() {
        try {
            let roleUsers = await this.roleUserModel.find().populate('resources').exec();
            let roleUserMapping = roleUsers.map((roleUser) => {
                return {
                    ...roleUser.toObject(),
                    resources: roleUser.resources.map((resource: any) => resource?.path),
                }
            })
            return ApiResponse.success('Operación realizada correctamente', roleUserMapping, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getRoleDefault() {
        try {
            let roleUser = await this.roleUserModel.findOne({ name: 'default' });
            return roleUser;
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async addResource(payload: AddResourceDto, id: string) {
        try {
            let roleUser = await this.roleUserModel.findById(id).exec();
            if (!roleUser) throw new NotFoundException({
                statusCode: 404,
                message: 'Rol no encontrado',
                error: 'rol no encontrado',
            });

            // Convertir a conjuntos para mejor manejo
            const currentResources = new Set(roleUser.resources);
            const newResources = new Set(payload.resource);

            // Recursos a agregar
            const resourcesToAdd = [...newResources].filter(resource => !currentResources.has(resource));

            // Recursos a eliminar
            const resourcesToRemove = [...currentResources].filter(resource => !newResources.has(resource));

            // Actualizar la lista de recursos
            roleUser.resources = [...newResources];

            await roleUser.save();

            // Opcional: Loggear cambios
            console.log(`Recursos agregados: ${resourcesToAdd.length}`);
            console.log(`Recursos eliminados: ${resourcesToRemove.length}`);

            return ApiResponse.success('Recursos agregados correctamente', null, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async deleteRole(id: string) {
        try {
            let roleUser = await this.roleUserModel.findById(id).exec();
            if (!roleUser) throw new NotFoundException({
                statusCode: 404,
                message: 'Rol no encontrado',
                error: 'rol no encontrado',
            });
            await this.roleUserModel.findByIdAndDelete(id);
            return ApiResponse.success('Rol eliminado correctamente', null, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getResourcesByRole(id: string) {
        try {
            let roleUser = await this.roleUserModel.findById(id).populate('resources').exec();
            if (!roleUser) throw new NotFoundException({
                statusCode: 404,
                message: 'Rol no encontrado',
                error: 'rol no encontrado',
            });
            return ApiResponse.success('Recursos obtenidos correctamente', roleUser.resources, HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}
