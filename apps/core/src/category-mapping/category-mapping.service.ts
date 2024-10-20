import { forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryMapping } from './category-mapping.schema';
import { CreateCategoryMappingDto, UpdateCategoryMappingDto } from './dto/category-mapping.dto';
import { ApiWoocommerceService } from '../api-woocommerce/api-woocommerce.service';
import { CreateWooCommerceCategoryDto } from '../woocommerce/dto/Category.dto';

@Injectable()
export class CategoryMappingService {
    constructor(
        @InjectModel('CategoryMapping') private readonly categoryMappingModel: Model<CategoryMapping>,
        @Inject(forwardRef(() => ApiWoocommerceService))
        private readonly apiWooCommerceService: ApiWoocommerceService,
    ) { }

    async create(createCategoryMappingDto: CreateCategoryMappingDto[]): Promise<CategoryMapping[]> {
        try {
            const createdMappings = createCategoryMappingDto.map((mapping: CreateCategoryMappingDto) => {
                return new this.categoryMappingModel({
                    companyId: mapping.companyId,
                    internalCategoryId: mapping.internalCategoryId,
                    internalSubCategoryId: mapping?.internalSubCategoryId ?? "",
                    woocommerceCategoryId: mapping.woocommerceCategoryId,
                    woocommerceSubCategoryId: mapping?.woocommerceSubCategoryId ?? "",
                    meliCategoryId: mapping?.meliCategoryId ?? "",
                    meliSubCategoryId: mapping?.meliSubCategoryId ?? "",
                    createdBy: mapping.createdBy,
                })
            });
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

    async findAllByCompany(companyId: string): Promise<CategoryMapping[]> {
        let records = await this.categoryMappingModel.find({ companyId }).exec();
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

    async syncCategoryMappingsWithWooCommerce(companyId: string, internalCategoryId: string, internalSubCategoryId: string): Promise<{ id: number }[]> {
        try {
            //const mapping = await this.categoryMappingModel.findOne({ companyId, internalCategoryId }).populate('internalCategoryId').exec();
            let categoryMapping = await this.categoryMappingModel.findOne({
                internalCategoryId,
                ...(internalSubCategoryId && { internalSubCategoryId })
            })
                .populate('internalCategoryId')
                .populate('internalSubCategoryId')
                .exec();

            if (!categoryMapping) {
                // Llamada al servicio de WooCommerce para sincronizar categoría
                let createCategoryDto: CreateWooCommerceCategoryDto = {
                    name: (categoryMapping.internalCategoryId as any).name,
                    slug: (categoryMapping.internalCategoryId as any).name,
                    parent: 0,
                    description: 'Categoría creada por el sistema de gestión de productos innventa.',
                    display: "default",
                    image: {
                        src: 'https://via.placeholder.com/150',
                        id: null,
                        name: null
                    },
                };
                let newCategoryWoo = await this.apiWooCommerceService.createProductCategoryWoocommerce(companyId, createCategoryDto);
                /* const newMapping = new this.categoryMappingModel({
                    companyId,
                    internalCategoryId,
                    woocommerceCategoryId: String(newCategoryWoo?.id)
                }); 
                await newMapping.save();
                */

                categoryMapping = await this.categoryMappingModel.create({
                    companyId,
                    internalCategoryId,
                    woocommerceCategoryId: String(newCategoryWoo?.id),
                })

                //Validar si existe una subcategoría interna
                if (internalSubCategoryId) {
                    try {
                        let createSubCategoryDto: CreateWooCommerceCategoryDto = {
                            name: (categoryMapping.internalSubCategoryId as any).name,
                            slug: (categoryMapping.internalSubCategoryId as any).name,
                            parent: newCategoryWoo?.id,
                            description: 'SubCategoría creada por el sistema de gestión de productos innventa.',
                            display: "subcategories",
                            image: {
                                src: 'https://via.placeholder.com/150',
                                id: null,
                                name: null
                            },
                        };
                        let createdSubCategoryWoo = await this.apiWooCommerceService.createProductCategoryWoocommerce(companyId, createSubCategoryDto);
                        // Actualizar el mapeo para incluir la subcategoría
                        categoryMapping.woocommerceSubCategoryId = String(createdSubCategoryWoo.id);
                        await categoryMapping.save();
                    } catch (error) {
                        console.log('Error al crear subcategoría en WooCommerce');
                    }

                }
            }

            const categories = [
                { id: Number(categoryMapping.woocommerceCategoryId) }
            ];

            // Si existe una subcategoría mapeada, se agrega al array de categorías
            if (categoryMapping.woocommerceSubCategoryId) {
                categories.push({ id: Number(categoryMapping.woocommerceSubCategoryId) });
            }

            return categories;
        } catch (error) {
            throw new Error('Error al realizar mapping de categorías con WooCommerce');
        }

    }

}
