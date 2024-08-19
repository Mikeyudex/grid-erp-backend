import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {v4} from 'uuid';
import { Warehouse } from './warehouse.schema';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
    constructor(
        @InjectModel('Warehouse') private readonly warehouseModel: Model<Warehouse>,
    ) { }

    async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
        createWarehouseDto.uuid = v4();
        const newcWarehouse = new this.warehouseModel(createWarehouseDto);
        return newcWarehouse.save();
    }

    async findAll(): Promise<Warehouse[]> {
        let warehouses = this.warehouseModel.find().lean();
        return warehouses;
    }

    async findAllByCompany(companyId:string): Promise<Warehouse[]> {
        let warehouses = this.warehouseModel.find({companyId}).lean();
        return warehouses;
    }

    async findOne(id: string): Promise<Warehouse> {
        const warehouse = await this.warehouseModel.findOne({ uuid: id }).lean();
        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${id} not found`);
        }
        return warehouse;
    }

    async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<boolean> {
        const updatedWarehouse = await this.warehouseModel.updateOne({ uuid: id }, updateWarehouseDto, { new: true }).exec();
        if (!updatedWarehouse) {
            throw new NotFoundException(`Warehouse with ID ${id} not found`);
        }
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const deletedWarehouse = await this.warehouseModel.deleteOne({ uuid: id }).exec();
        if (!deletedWarehouse) {
            throw new NotFoundException(`Warehouse with ID ${id} not found`);
        }
        return true;
    }

}
