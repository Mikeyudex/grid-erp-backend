import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';

import { ApiWoocommerceService } from './api-woocommerce.service';
import { CreateProductDto } from '../products/dto/create-product.dto';

@Controller('api-woocommerce')
export class ApiWoocommerceController {
    constructor(
        private readonly apiWoocommerceService: ApiWoocommerceService,
    ) { }

    @Get('/getCategoriesWoocommerce/:companyId')
    async getCategoriesWoocommerce(@Param('companyId') companyId: string) {
        try {
            const response = await this.apiWoocommerceService.getCategoriesWoocommerce(companyId);
            return { success: true, result: response };
        } catch (error) {
            console.error('Error al obtener categorías con WooCommerce:', error);
            throw error;
        }
    }

    @Post('/createProductWoocommerce/:companyId/:productId')
    async createProduct(
        @Param('companyId') companyId: string,
        @Param('productId') productId: Types.ObjectId,
        @Body() productData: any) {
        return this.apiWoocommerceService.createProductForCompany(companyId, productData, productId);
    }

    @Post('/syncProduct/:companyId/:productId')
    async syncProduct(
        @Param('companyId') companyId: string,
        @Param('productId') productId: Types.ObjectId,
        @Body() createProductDto: CreateProductDto,
        @Res() res: Response,
    ) {
        res.status(200).json({ success: true, message: 'Solicitud recibida, se notificará cuando se haya completado la sincronización' });
        this.apiWoocommerceService.syncProductSingle(companyId, createProductDto, productId);
    }

    @Post('/queue/syncProduct/:companyId/:productId')
    async queueSyncProduct(
        @Param('companyId') companyId: string,
        @Param('productId') productId: Types.ObjectId,
        @Body() createProductDto: CreateProductDto,
        @Res() res: Response,
    ) {
        res.status(200).json({ success: true, message: 'Solicitud recibida, se notificará cuando se haya completado la sincronización' });
        this.apiWoocommerceService.syncProductsingleQueue(companyId, createProductDto, productId);
    }

    @Get('/getProductsWoocommerce/:companyId')
    async getProductsWoocommerce(@Param('companyId') companyId: string) {
        return this.apiWoocommerceService.getProductsWoocommerce(companyId);
    }

}
