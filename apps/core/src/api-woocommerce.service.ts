import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WoocommerceService } from './woocommerce/woocommerce.service';
import { CreateWooCommerceCategoryDto, ResponseWooCommerceCategoryDto } from './woocommerce/dto/Category.dto';

@Injectable()
export class ApiWoocommerceService {
  private readonly logger = new Logger(ApiWoocommerceService.name);

  constructor(
    @Inject('WOOCOMMERCE_SERVICE') private readonly client: ClientProxy,
    private readonly woocommerceService: WoocommerceService,
  ) { }

  async createProductForCompany(companyId: string, productData: any) {
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
      .subscribe((response: any) => {
        console.log('Producto creado');
        this.logger.log(response);
        //TODO notificar al usuario que el producto se ha creado correctamente en woocommerce
        return response;
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
          .subscribe((response: any) => {
            console.log('Categría creada');
            resolve(response);
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
          .subscribe((response: any) => {
            console.log('Categorías obtenidas');
            resolve(response);
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
      .subscribe((response: any) => {
        console.log('Productos obtenidos');
        this.logger.log(response);
        return response;
      });
  }

}
