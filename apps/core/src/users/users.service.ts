import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './users.schema';
import { CreateUserDto, UpdateUserDto } from './dtos/users.dto';
import { LoginResponseDto } from '../auth/dtos/login.dto';

@Injectable()
export class UsersService {
    companyId: string;

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) { this.companyId = "3423f065-bb88-4cc5-b53a-63290b960c1a" }

    findAll() {
        return this.userModel.find().exec();
    }

    async findOne(id: string) {
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