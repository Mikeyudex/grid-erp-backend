import { Module } from '@nestjs/common';
import { MovementService } from './movement.service';
import { MovementController } from './movement.controller';
import { StockModule } from '../stock/stock.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MovementSchema, Movement } from './movement.schema';

@Module({
  imports:[
    StockModule,
    MongooseModule.forFeature([{ name: Movement.name, schema: MovementSchema }]),
  ],
  providers: [MovementService],
  controllers: [MovementController]
})
export class MovementModule {}
