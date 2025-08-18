import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderSchema } from './purchase-order.schema';
import { PurchaseOrderValidationMiddleware } from './purchase-order.middleware';
import { PurchaseOrderDAO } from './purchase-order.dao';
import { ProductsModule } from '../products/products.module';
import { Counter, CounterSchema } from './counter.schema';
import { PurchaseOrderHistory, PurchaseOrderHistorySchema } from './purchase-order-history.schema';
import { UsersModule } from '../users/users.module';
import { AccountingModule } from '../accounting/accounting.module';
import { DebtModule } from '../debt/debt.module';
import { Account, AccountSchema } from '../accounting/schemas/account.schema';
import { Income, IncomeSchema } from '../accounting/schemas/income.schema';
import { Debt, DebtSchema } from '../debt/debt.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: PurchaseOrder.name, schema: PurchaseOrderSchema }]),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    MongooseModule.forFeature([{ name: PurchaseOrderHistory.name, schema: PurchaseOrderHistorySchema }]),
    MongooseModule.forFeature([{ name: PurchaseOrderItem.name, schema: PurchaseOrderSchema }]),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }]),
    ProductsModule,
    UsersModule,
    AccountingModule,
    DebtModule
  ],
  providers: [PurchaseOrderService, PurchaseOrderDAO],
  controllers: [PurchaseOrderController]
})
export class PurchaseOrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PurchaseOrderValidationMiddleware)
      .forRoutes({ path: 'purchase-order/create', method: RequestMethod.POST });
  }
}
