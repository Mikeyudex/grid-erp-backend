import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PurchaseOrder, PurchaseOrderSchema } from '../purchase-order/purchase-order.schema';
import { Debt, DebtSchema } from '../debt/debt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PurchaseOrder.name, schema: PurchaseOrderSchema }]),
    MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController]
})
export class ReportsModule { }
