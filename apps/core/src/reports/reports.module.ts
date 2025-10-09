import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PurchaseOrder, PurchaseOrderSchema } from '../purchase-order/purchase-order.schema';
import { Debt, DebtSchema } from '../debt/debt.schema';
import { Account, AccountSchema } from '../accounting/schemas/account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PurchaseOrder.name, schema: PurchaseOrderSchema }]),
    MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }]),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController]
})
export class ReportsModule { }
