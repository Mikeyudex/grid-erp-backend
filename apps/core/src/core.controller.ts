import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiWoocommerceService } from './api-woocommerce.service';

@Controller()
export class CoreController {
  constructor(
    private readonly apiWoocommerceService: ApiWoocommerceService,
  ) {}

  @Get('getCategoriesWoocommerce/:companyId')
  async getCategoriesWoocommerce(@Param('companyId') companyId: string) {
    try {
    const response = await this.apiWoocommerceService.getCategoriesWoocommerce(companyId);
    return { success: true, result: response };
    } catch (error) {
      console.error('Error al obtener categorías con WooCommerce:', error);
      throw error;
    }
  }

  @Post('createProductWoocommerce/:companyId')
  async createProduct(@Param('companyId') companyId: string, @Body() productData: any) {
    return this.apiWoocommerceService.createProductForCompany(companyId, productData);
  }

  @Get('getProductsWoocommerce/:companyId')
  async getProductsWoocommerce(@Param('companyId') companyId: string) {
    return this.apiWoocommerceService.getProductsWoocommerce(companyId);
  }

}
