import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CoreService {
  constructor(@Inject('WOOCOMMERCE_SERVICE') private readonly client: ClientProxy) { }

  async createProductForCompany(companyId: string, productData: any) {
    // Obtener credenciales de la compañía (puedes obtenerlas desde la base de datos)
    /* const company = await this.getCompany(companyId); // Método que implementa la lógica para obtener la compañía

    const wooCommerceUrl = company.wooCommerceUrl;
    const consumerKey = company.wooCommerceConsumerKey;
    const consumerSecret = company.wooCommerceConsumerSecret; */

    const payload = {
      wooCommerceUrl:"",
      consumerKey:"",
      consumerSecret:"",
      productData:{},
    };

    return this.client.send({ cmd: 'create-product' }, payload).toPromise();
  }

}
