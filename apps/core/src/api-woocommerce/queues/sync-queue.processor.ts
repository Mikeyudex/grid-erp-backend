import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ApiWoocommerceService } from '../api-woocommerce.service';
import { JobsQueuesEnum, QueuesEnum } from '../../common/config/queues.enum';

@Processor(QueuesEnum.SyncWoo)
export class SyncQueueProcessor {
    constructor(private readonly apiWoocommerceService: ApiWoocommerceService) { }

    @Process(JobsQueuesEnum.SyncWooProduct)
    async processHandleSyncProduct(job: Job) {
        const data = job.data;
        try {
            const result = await this.apiWoocommerceService.syncProductSingle(data?.companyId, data?.createProductDto, data?.productId);
            job.log('Producto sincronizado con WooCommerce');
            job.progress(100);
            job.isCompleted();
            return result;
        } catch (error) {
            job.log('Error durante la sincronización: ' + JSON.stringify(error));
            job.isFailed();
            job.progress(0);
            throw new Error('Error durante la sincronización: ' + JSON.stringify(error) + ' - JobID: ' + job.id);
        }
    }
}
