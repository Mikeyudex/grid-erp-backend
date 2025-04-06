import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseOrder, PurchaseOrderSchema } from './purchase-order.schema';
import { PurchaseOrderValidationMiddleware } from './purchase-order.middleware';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: PurchaseOrder.name, schema: PurchaseOrderSchema }])
  ],
  providers: [PurchaseOrderService],
  controllers: [PurchaseOrderController]
})
export class PurchaseOrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PurchaseOrderValidationMiddleware)
      .forRoutes({ path: 'purchase-order/create', method: RequestMethod.POST });
  }
}
