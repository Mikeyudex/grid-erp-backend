import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryMapping } from './category-mapping.schema';
import { CreateCategoryMappingDto, UpdateCategoryMappingDto } from './dto/category-mapping.dto';

@Injectable()
export class CategoryMappingService {
    constructor(
        @InjectModel('CategoryMapping') private readonly categoryMappingModel: Model<CategoryMapping>,
    ) { }

    async create(mappings: CreateCategoryMappingDto[]): Promise<CategoryMapping[]> {
        try {
            const createdMappings = mappings.map(mapping => new this.categoryMappingModel(mapping));
            return await this.categoryMappingModel.insertMany(createdMappings);
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Error al crear los mapeos de categoría',
                    error: error.message, // Detalles adicionales del error
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
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
