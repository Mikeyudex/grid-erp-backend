import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryMapping } from './category-mapping.schema';
import { CreateCategoryMappingDto, UpdateCategoryMappingDto } from './dto/category-mapping.dto';

@Injectable()
export class CategoryMappingService {
    constructor(
        @InjectModel('CategoryMapping') private readonly categoryMappingModel: Model<CategoryMapping>,
    ) { }

    async create(createCategoryMappingDto: CreateCategoryMappingDto): Promise<CategoryMapping> {
        const newRecord = new this.categoryMappingModel(createCategoryMappingDto);
        return newRecord.save();
    }

    async findAll(): Promise<CategoryMapping[]> {
        let records = this.categoryMappingModel.find().exec();
        return records;
    }

    async findOne(id: string): Promise<CategoryMapping> {
        const record = await this.categoryMappingModel.findById(id).exec();
        if (!record) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        return record;
    }

    async update(id: string, updateCategoryMappingDto: UpdateCategoryMappingDto): Promise<boolean> {
        const updatedRecord = await this.categoryMappingModel.findByIdAndUpdate(id, updateCategoryMappingDto, { new: true }).exec();
        if (!updatedRecord) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const deletedRecord = await this.categoryMappingModel.findByIdAndDelete(id).exec();
        if (!deletedRecord) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        return true;
    }

}
