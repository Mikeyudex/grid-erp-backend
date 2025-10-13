import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PurchaseOrder, PurchaseOrderSchema } from '../purchase-order/purchase-order.schema';
import { Debt, DebtSchema } from '../debt/debt.schema';
import { Account, AccountSchema } from '../accounting/schemas/account.schema';
import { Income, IncomeSchema } from '../accounting/schemas/income.schema';
import { Expense, ExpenseSchema } from '../accounting/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PurchaseOrder.name, schema: PurchaseOrderSchema }]),
    MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }]),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController]
})
export class ReportsModule { }
