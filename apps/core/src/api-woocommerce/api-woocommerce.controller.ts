import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
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

    @Post('/createProductWoocommerce/:companyId')
    async createProduct(@Param('companyId') companyId: string, @Body() productData: any) {
        return this.apiWoocommerceService.createProductForCompany(companyId, productData);
    }

    @Post('/syncProduct/:companyId')
    async syncProduct(
        @Param('companyId') companyId: string,
        @Body() createProductDto: CreateProductDto,
        @Res() res: Response,
    ) {
        res.status(200).json({ success: true, message: 'Solicitud recibida, se notificará cuando se haya completado la sincronización' });
        this.apiWoocommerceService.syncProductSingle(companyId, createProductDto);
    }

    @Get('/getProductsWoocommerce/:companyId')
    async getProductsWoocommerce(@Param('companyId') companyId: string) {
        return this.apiWoocommerceService.getProductsWoocommerce(companyId);
    }

}
