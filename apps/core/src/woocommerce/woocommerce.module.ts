import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { WoocommerceService } from './woocommerce.service';
import { WoocommerceController } from './woocommerce.controller';
import { WoocommerceValidationMiddleware } from './middlewares/woocommerce-validation.middleware';
import { WoocommerceSchema } from './woocommerce.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Woocommerce', schema: WoocommerceSchema }]),
  ],
  providers: [WoocommerceService],
  controllers: [WoocommerceController],
  exports: [WoocommerceService]
})
export class WoocommerceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WoocommerceValidationMiddleware)
      .forRoutes(
        { path: 'woocommerce/create', method: RequestMethod.POST },
      );
  }
}
