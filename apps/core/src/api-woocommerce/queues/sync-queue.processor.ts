import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ApiWoocommerceService } from '../api-woocommerce.service';
import { CreateProductWooDto } from '../../woocommerce/dto/CreateProduct.dto';

@Processor('sync-products-woocommerce')
export class SyncQueueProcessor {
    constructor(private readonly apiWoocommerceService: ApiWoocommerceService) { }

    @Process('sync-product-woocommerce')
    async processHandleSyncProduct(job: Job) {
        const { payload, companyId } = job.data;
        try {
            const result = await this.apiWoocommerceService.syncProductSingle(companyId, payload);
            return result;
        } catch (error) {
            throw new Error('Error durante la sincronización: ' + error.message);
        }
    }
}
