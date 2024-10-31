import { forwardRef, Module } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ProductsModule } from './products.module';
import { BullModule } from '@nestjs/bull';
import { QueuesEnum } from '../common/config/queues.enum';
import { ImportsQueueProcessor } from './queues/imports-queue.processor';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { ProviderModule } from '../provider/provider.module';
import { TaxesModule } from '../taxes/taxes.module';
import { UnitOfMeasureModule } from '../unit-of-measure/unit-of-measure.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        forwardRef(() => ProductsModule),
        ClientsModule.register([
            {
                name: 'WEBSOCKET_SERVICE',
                transport: Transport.REDIS,
                options: {
                    host: 'localhost',
                    port: 6379,
                    retryAttempts: 5,
                    retryDelay: 3000,
                },
            },
        ]),
        BullModule.registerQueue({
            name: QueuesEnum.Imports,
        }),
        WarehouseModule,
        ProviderModule,
        TaxesModule,
        UnitOfMeasureModule
    ],
    providers: [ImportsService, ImportsQueueProcessor],
    exports: [ImportsService],
})
export class ImportsProductsModule { }
