import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account.schema';
import { MethodOfPayment, MethodOfPaymentSchema } from './schemas/methodOfPayment.schema';
import { PaymentMethod, PaymentMethodSchema } from './schemas/paymentMethod.schema';
import { PaymentMethodService } from './services/paymentMethod.service';
import { Income, IncomeSchema } from './schemas/income.schema';
import { IncomeService } from './services/Income.service';
import { AccountService } from './services/account.service';
import { Debt, DebtSchema } from '../debt/debt.schema';
import { TypeOfExpense, TypeOfExpenseSchema } from './schemas/type-of-expense.schema';
import { TypeOfExpenseService } from './services/type-of-expense.service';
import { ExpenseService } from './services/expense.service';
import { Expense, ExpenseSchema } from './schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: MethodOfPayment.name, schema: MethodOfPaymentSchema }]),
    MongooseModule.forFeature([{ name: PaymentMethod.name, schema: PaymentMethodSchema }]),
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }]),
    MongooseModule.forFeature([{ name: TypeOfExpense.name, schema: TypeOfExpenseSchema }]),
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
  ],
  providers: [
    AccountingService,
    PaymentMethodService,
    IncomeService,
    AccountService,
    TypeOfExpenseService,
    ExpenseService
  ],
  controllers: [AccountingController],
  exports: [AccountingService,
    PaymentMethodService,
    IncomeService,
    AccountService,
    TypeOfExpenseService,
    ExpenseService
  ]
})
export class AccountingModule { }
