import { Module } from '@nestjs/common';
import { StockAdjustmentService } from './stock-adjustment.service';
import { StockAdjustmentController } from './stock-adjustment.controller';
import { StockModule } from '../stock/stock.module';
import { StockAdjustmentSchema, StockAdjustment } from './stock-adjustment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MovementModule } from '../movement/movement.module';

@Module({
  imports: [
    StockModule,
    MovementModule,
    MongooseModule.forFeature([{ name: StockAdjustment.name, schema: StockAdjustmentSchema }]),
  ],
  providers: [StockAdjustmentService],
  controllers: [StockAdjustmentController]
})
export class StockAdjustmentModule { }
