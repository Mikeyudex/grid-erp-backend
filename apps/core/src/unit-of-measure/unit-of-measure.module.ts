import { Module } from '@nestjs/common';
import { UnitOfMeasureService } from './unit-of-measure.service';
import { UnitOfMeasureController } from './unit-of-measure.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitOfMeasure, UnitOfMeasureSchema } from './unit-of-measure.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: UnitOfMeasure.name, schema: UnitOfMeasureSchema }]),
  ],
  providers: [UnitOfMeasureService],
  controllers: [UnitOfMeasureController],
  exports:[UnitOfMeasureService]
})
export class UnitOfMeasureModule {}
