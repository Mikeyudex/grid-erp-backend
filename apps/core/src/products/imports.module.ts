import { Module } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ProductsModule } from './products.module';
import { BullModule } from '@nestjs/bull';
import { QueuesEnum } from '../common/config/queues.enum';

@Module({
    imports: [ProductsModule,
        BullModule.registerQueue({
            name: QueuesEnum.Imports,
        }),
    ],
    providers: [ImportsService],
    exports: [ImportsService],
})
export class ImportsProductsModule { }
