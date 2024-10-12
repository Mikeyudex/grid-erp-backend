import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CoreService } from './core.service';

@Controller()
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @Get('getCategoriesWoocommerce/:companyId')
  async getCategoriesWoocommerce(@Param('companyId') companyId: string) {
    try {
    const response = await this.coreService.getCategoriesWoocommerce(companyId);
    return { success: true, result: response };
    } catch (error) {
      console.error('Error al obtener categorías con WooCommerce:', error);
      throw error;
    }
  }

  @Post('createProduct')
  async createProduct(@Param('companyId') companyId: string, @Body() productData: any) {
    return this.coreService.createProductForCompany(companyId, productData);
  }

  @Get('getProductsWoocommerce')
  async getProductsWoocommerce(@Param('companyId') companyId: string) {
    return this.coreService.getProductsWoocommerce(companyId);
  }

}
