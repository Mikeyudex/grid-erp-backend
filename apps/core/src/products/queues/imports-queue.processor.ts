import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { ImportsService } from '../imports.service';
import { JobsQueuesEnum, QueuesEnum } from '../../common/config/queues.enum';

@Processor(QueuesEnum.Imports)
export class ImportsQueueProcessor {
    constructor(private readonly importsService: ImportsService) { }

    @Process(JobsQueuesEnum.ImportProductsFromXlsx)
    async processHandleImportProductsFromXlsx(job: Job) {
        const data = job.data;
        try {
            const result = await this.importsService.importProductsFromXlsx(data?.file, data?.companyId, job);
            job.log('Productos importados');
            //job.progress(100);
            job.isCompleted();
            return result;
        } catch (error) {
            job.log('Error durante la importación: ' + JSON.stringify(error));
            job.isFailed();
            job.progress(0);
            throw new Error('Error durante la importación: ' + JSON.stringify(error) + ' - JobID: ' + job.id);
        }
    }
}
