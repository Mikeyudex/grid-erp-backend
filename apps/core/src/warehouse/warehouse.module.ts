import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WarehouseSchema } from './warehouse.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Warehouse', schema: WarehouseSchema }]),
  ],
  providers: [WarehouseService],
  controllers: [WarehouseController]
})
export class WarehouseModule {}
