import { forwardRef, Module } from '@nestjs/common';
import { ApiWoocommerceService } from './api-woocommerce.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WoocommerceModule } from '../woocommerce/woocommerce.module';
import { CategoryMappingModule } from '../category-mapping/category-mapping.module';
import { ApiWoocommerceController } from './api-woocommerce.controller';
import { BullModule } from '@nestjs/bull';
import { SyncQueueProcessor } from './queues/sync-queue.processor';
import { ProductsModule } from '../products/products.module';
import { QueuesEnum } from '../common/config/queues.enum';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'WOOCOMMERCE_SERVICE',
                transport: Transport.REDIS,
                options: {
                    host: 'localhost',
                    port: 6379,
                    //password: 'myRedisPassword', // Si tu servidor Redis necesita autenticación
                    retryAttempts: 5,            // Número de intentos de reconexión
                    retryDelay: 3000,            // Tiempo de espera entre intentos (en milisegundos)
                },
            },
        ]),
        BullModule.registerQueue({
            name: QueuesEnum.SyncWoo,  // Registrar la cola de sincronización
        }),
        WoocommerceModule,
        forwardRef(() => CategoryMappingModule),
        ProductsModule,
    ],
    controllers: [ApiWoocommerceController],
    providers: [ApiWoocommerceService, SyncQueueProcessor],
    exports: [ApiWoocommerceService],
})
export class ApiWoocommerceModule { }
