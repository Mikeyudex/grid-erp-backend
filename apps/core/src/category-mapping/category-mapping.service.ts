import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryMapping } from './category-mapping.schema';
import { CreateCategoryMappingDto, UpdateCategoryMappingDto } from './dto/category-mapping.dto';
import { ApiWoocommerceService } from '../api-woocommerce.service';
import { CreateWooCommerceCategoryDto } from '../woocommerce/dto/Category.dto';

@Injectable()
export class CategoryMappingService {
    constructor(
        @InjectModel('CategoryMapping') private readonly categoryMappingModel: Model<CategoryMapping>,
        private readonly apiWooCommerceService: ApiWoocommerceService,
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

    async syncCategoryMappingsWithWooCommerce(companyId: string, internalCategoryId: string): Promise<string> {
        const mapping = await this.categoryMappingModel.findOne({ companyId, internalCategoryId }).populate('internalCategoryId').exec();

        if (!mapping) {
            // Llamada al servicio de WooCommerce para sincronizar categoría
            let createCategoryDto: CreateWooCommerceCategoryDto = {
                name: (mapping.internalCategoryId as any).name,
                slug: (mapping.internalCategoryId as any).name,
                parent: 0,
                description: 'Categoría creada por el sistema de gestión de productos',
                display: "default",
                image: {
                    src: 'https://via.placeholder.com/150',
                    id: null,
                    name: null
                },
            };
            let newCategoryWoo = await this.apiWooCommerceService.createProductCategoryWoocommerce(companyId, createCategoryDto);
            const newMapping = new this.categoryMappingModel({
                companyId,
                internalCategoryId,
                woocommerceCategoryId: String(newCategoryWoo?.id)
            });
            await newMapping.save();
            return String(newCategoryWoo?.id);
        }

        return mapping.woocommerceCategoryId;
    }

}
