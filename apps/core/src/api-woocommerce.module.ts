import { Module } from '@nestjs/common';
import { ApiWoocommerceService } from './api-woocommerce.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WoocommerceModule } from './woocommerce/woocommerce.module';

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
    ],
    providers: [ApiWoocommerceService],
    exports: [ApiWoocommerceService],
})
export class ApiWoocommerceModule { }
