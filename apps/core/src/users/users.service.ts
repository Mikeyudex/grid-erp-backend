import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, Types as MongooseTypes } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './users.schema';
import { CreateUserDto, UpdateUserDto } from './dtos/users.dto';
import { LoginResponseDto } from '../auth/dtos/login.dto';
import { Types } from 'joi';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class UsersService {
    companyId: string;

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) { this.companyId = "3423f065-bb88-4cc5-b53a-63290b960c1a" }

    async findAll(filter?: string, value?: string) {
        let filterBy = filter ? { [filter]: value } : {};
        try {
            let users = await this.userModel.find(filterBy).exec();
            if (!users || users.length === 0) {
                throw new InternalServerErrorException({
                    statusCode: 404,
                    message: 'No se encontraron usuarios',
                });
            }
            let usersMap = users.map((user: User) => {
                return {
                    id: user._id.toString(),
                    email: user?.email,
                    phone: user?.phone,
                    name: user?.name,
                    lastname: user?.lastname,
                    role: user?.role,
                    active: user?.active,
                }
            });
            return ApiResponse.success('Lista de usuarios obtenida con éxito', usersMap);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async findOne(id: MongooseTypes.ObjectId | string) {
        return this.userModel.findById(id);
    }


    async create(data: CreateUserDto) {
        const newModel = new this.userModel(data);
        const hashPassword = await bcrypt.hash(newModel.password, 10);
        newModel.password = hashPassword;
        newModel.companyId = this.companyId;

        const model = await newModel.save();
        const modelObject = model.toObject();
        return new LoginResponseDto(modelObject);
    }

    findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    findById(id: string) {
        return this.userModel.findById({ id }).exec();
    }

    update(id: string, changes: UpdateUserDto) {
        return this.userModel
            .findByIdAndUpdate(id, { $set: changes }, { new: true })
            .exec();
    }

    remove(id: string) {
        return this.userModel.findByIdAndDelete(id);
    }
}