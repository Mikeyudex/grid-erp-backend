import { Injectable, Inject, Logger, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Model, Types } from 'mongoose';

import { WoocommerceService } from '../woocommerce/woocommerce.service';
import { CreateWooCommerceCategoryDto, ResponseWooCommerceCategoryDto } from '../woocommerce/dto/Category.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { CreateProductWooDto } from '../woocommerce/dto/CreateProduct.dto';
import { CategoryMappingService } from '../category-mapping/category-mapping.service';
import { HttpResponseWooDto } from './dto/HttpResponseWoo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDocument } from '../products/product.schema';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';

@Injectable()
export class ApiWoocommerceService {
    private readonly logger = new Logger(ApiWoocommerceService.name);

    constructor(
        @Inject('WOOCOMMERCE_SERVICE') private readonly client: ClientProxy,
        private readonly woocommerceService: WoocommerceService,
        @Inject(forwardRef(() => CategoryMappingService))
        private readonly categoryMappingService: CategoryMappingService,
        @InjectQueue('sync-products-woocommerce') private readonly syncQueue: Queue,
        @InjectModel('Product') private readonly productModel: Model<ProductDocument>,
    ) { }

    async createProductForCompany(companyId: string, productData: any, productId: Types.ObjectId) {
        return new Promise(async (resolve, reject) => {
            const woocommerceConfigs = await this.woocommerceService.findByCompanyId(companyId);

            const wooCommerceUrl = woocommerceConfigs.wooCommerceUrl;
            const consumerKey = woocommerceConfigs.wooCommerceConsumerKey;
            const consumerSecret = woocommerceConfigs.wooCommerceConsumerSecret;

            const payload = {
                wooCommerceUrl: wooCommerceUrl,
                consumerKey: consumerKey,
                consumerSecret: consumerSecret,
                payload: productData,
            };

            this.client.send({ cmd: 'create-product' }, payload)
                .subscribe(async (response: HttpResponseWooDto) => {
                    try {
                        if (response.success) {

                            console.log('Producto creado');
                            const product = await this.productModel.findById(productId).exec();

                            if (!product) {
                                throw new Error('Producto no encontrado');
                            }
                            // Actualizar solo la parte de WooCommerce en syncInfo
                            product.syncInfo.woocommerce.synced = true;
                            product.syncInfo.woocommerce.productId = String(response.dataWoo.id);
                            product.syncInfo.woocommerce.lastSyncedAt = getCurrentUTCDate();
                            await product.save();
                            
                            //this.logger.log(response.dataWoo);
                            //TODO notificar al usuario que el producto se ha creado correctamente en woocommerce
                            resolve(response);
                        } else {
                            this.logger.log(JSON.stringify(response));
                            reject(response);
                        }
                    } catch (error) {
                        reject(response);
                    }
                });
        });
    }

    async createProductCategoryWoocommerce(companyId: string, createCategoryDto: CreateWooCommerceCategoryDto): Promise<ResponseWooCommerceCategoryDto> {
        return new Promise(async (resolve, reject) => {
            try {
                const woocommerceConfigs = await this.woocommerceService.findByCompanyId(companyId);

                const wooCommerceUrl = woocommerceConfigs.wooCommerceUrl;
                const consumerKey = woocommerceConfigs.wooCommerceConsumerKey;
                const consumerSecret = woocommerceConfigs.wooCommerceConsumerSecret;

                const payload = {
                    wooCommerceUrl: wooCommerceUrl,
                    consumerKey: consumerKey,
                    consumerSecret: consumerSecret,
                    payload: createCategoryDto,
                };

                this.client.send({ cmd: 'create-category' }, payload)
                    .subscribe((response: HttpResponseWooDto) => {
                        if (response.success) {
                            console.log('Categría creada');
                            resolve(response.dataWoo);
                        } else {
                            reject(response);
                        }
                    });
            } catch (error) {
                reject(error);
            }
        });

    }

    async getCategoriesWoocommerce(companyId: string) {

        return new Promise(async (resolve, reject) => {
            try {
                const woocommerceConfigs = await this.woocommerceService.findByCompanyId(companyId);

                const wooCommerceUrl = woocommerceConfigs.wooCommerceUrl;
                const consumerKey = woocommerceConfigs.wooCommerceConsumerKey;
                const consumerSecret = woocommerceConfigs.wooCommerceConsumerSecret;

                const payload = {
                    wooCommerceUrl: wooCommerceUrl,
                    consumerKey: consumerKey,
                    consumerSecret: consumerSecret
                };

                this.client.send({ cmd: 'get-categories' }, payload)
                    .subscribe((response: HttpResponseWooDto) => {
                        if (response.success) {
                            console.log('Categorías obtenidas');
                            resolve(response.dataWoo);
                        } else {
                            throw new Error('Error al obtener categorías en WooCommerce' + response);
                        }
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    async getProductsWoocommerce(companyId: string) {
        const woocommerceConfigs = await this.woocommerceService.findByCompanyId(companyId);

        const wooCommerceUrl = woocommerceConfigs.wooCommerceUrl;
        const consumerKey = woocommerceConfigs.wooCommerceConsumerKey;
        const consumerSecret = woocommerceConfigs.wooCommerceConsumerSecret;

        const payload = {
            wooCommerceUrl: wooCommerceUrl,
            consumerKey: consumerKey,
            consumerSecret: consumerSecret
        };

        this.client.send({ cmd: 'get-products' }, payload)
            .subscribe((response: HttpResponseWooDto) => {
                if (response.success) {
                    console.log('Productos obtenidos');
                    return response.dataWoo;
                } else {
                    throw new Error('Error al obtener productos en WooCommerce' + response);
                }
            });
    }

    async syncProductSingle(companyId: string, createProductDto: CreateProductDto, productId: Types.ObjectId) {
        const wooCategoriesId = await this.categoryMappingService.syncCategoryMappingsWithWooCommerce(companyId, createProductDto.id_category.toString(), createProductDto.id_sub_category);
        const createProductWooDto = this.homologateProduct(createProductDto);
        createProductWooDto.categories = wooCategoriesId;
        return this.createProductForCompany(companyId, createProductWooDto, productId);
    }

    async syncProductsingleQueue(companyId: string, createProductDto: CreateProductDto, productId: Types.ObjectId) {
        try {
            // Añadir el trabajo de sincronización a la cola
            await this.syncQueue.add(
                'sync-product-woocommerce',
                { companyId, createProductDto, productId },
                { attempts: 3, backoff: { type: 'exponential', delay: 60000 }, });
            return { message: 'Producto en cola de sincronización.' };
        } catch (error) {
            throw new Error('Error al encolar la sincronización.');
        }
    }

    homologateProduct(createProductDto: CreateProductDto): CreateProductWooDto {
        let increase = 20;
        let priceIncrease = this.increasePrice(createProductDto.salePrice, increase);
        let createProductWooDto: CreateProductWooDto = {
            name: createProductDto.name,
            slug: createProductDto.name,
            description: createProductDto.description,
            short_description: createProductDto.description,
            sku: createProductDto.sku,
            price: createProductDto.salePrice.toString(),
            regular_price: priceIncrease.toString(),
            sale_price: createProductDto.salePrice.toString(),
            date_on_sale_from: null,
            date_on_sale_from_gmt: null,
            date_on_sale_to: null,
            date_on_sale_to_gmt: null,
            on_sale: false,
            purchasable: true,
            total_sales: 0,
            virtual: false,
            downloadable: false,
            downloads: [],
            external_url: null,
            button_text: null,
            tax_status: 'taxable',
            tax_class: '',
            manage_stock: true,
            stock_quantity: createProductDto.quantity,
            stock_status: 'instock',
            backorders: 'no',
            backorders_allowed: false,
            backordered: false,
            sold_individually: false,
            weight: '',
            dimensions: { length: '', width: '', height: '' },
            shipping_required: false,
            shipping_taxable: false,
            shipping_class: '',
            shipping_class_id: 0,
            reviews_allowed: false,
            average_rating: '0.00',
            rating_count: 0,
            related_ids: [],
            upsell_ids: [],
            cross_sell_ids: [],
            parent_id: 0,
            purchase_note: '',
            categories: [],
            tags: [],
            images: this.prepareImagesProduct(createProductDto),
            attributes: [],
            default_attributes: [],
            variations: [],
            grouped_products: [],
            menu_order: 0,
        };

        return createProductWooDto;
    }

    prepareImagesProduct(createProductDto: CreateProductDto): { src: string }[] {
        let images = createProductDto.additionalConfigs.images;
        if (images) {
            let imagesProduct = [];
            for (let index = 0; index < images.length; index++) {
                const image = images[index];
                let imageProduct = {
                    src: image
                };
                imagesProduct.push(imageProduct);
            }
            return imagesProduct;
        } else {
            return [{ src: null }];
        }
    }

    randomId() {
        return Math.floor(Math.random() * 10000);
    }


    increasePrice(totalPrice: number, percentageDiscount: number): number {
        // Asegurarse de que los valores sean números
        if (typeof totalPrice !== 'number' || typeof percentageDiscount !== 'number') {
            throw new Error('Los parámetros deben ser números');
        }

        // Calcular el descuento
        const discountAmount = (totalPrice * percentageDiscount) / 100;

        // Calcular el precio final añadiendo el incremento
        const finalPrice = totalPrice + discountAmount;

        return finalPrice;
    }
}


