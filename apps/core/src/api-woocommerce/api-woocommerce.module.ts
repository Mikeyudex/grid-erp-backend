import { forwardRef, Module } from '@nestjs/common';
import { ApiWoocommerceService } from './api-woocommerce.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WoocommerceModule } from '../woocommerce/woocommerce.module';
import { CategoryMappingModule } from '../category-mapping/category-mapping.module';
import { ApiWoocommerceController } from './api-woocommerce.controller';

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
        WoocommerceModule,
        forwardRef(() => CategoryMappingModule),
    ],
    controllers: [ApiWoocommerceController],
    providers: [ApiWoocommerceService],
    exports: [ApiWoocommerceService],
})
export class ApiWoocommerceModule { }
