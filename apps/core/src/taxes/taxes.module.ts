import { Module } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { TaxesController } from './taxes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tax, TaxSchema } from './taxes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tax.name, schema: TaxSchema }]),
  ],
  providers: [TaxesService],
  controllers: [TaxesController],
  exports:[TaxesService]
})
export class TaxesModule {}
