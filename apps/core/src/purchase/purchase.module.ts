import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from '../purchase-order/counter.schema';
import { Purchase, PurchaseSchema } from './purchase.schema';
import { AccountingModule } from '../accounting/accounting.module';
import { Tax } from '../taxes/taxes.schema';
import { TaxSchema } from '@shared/index';
import { Retention, RetentionSchema } from '../retention/retention.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    MongooseModule.forFeature([{ name: Purchase.name, schema: PurchaseSchema }]),
    MongooseModule.forFeature([{ name: Tax.name, schema: TaxSchema }]),
    MongooseModule.forFeature([{ name: Retention.name, schema: RetentionSchema }]),
    AccountingModule
  ],
  providers: [PurchaseService],
  controllers: [PurchaseController]
})
export class PurchaseModule {}
