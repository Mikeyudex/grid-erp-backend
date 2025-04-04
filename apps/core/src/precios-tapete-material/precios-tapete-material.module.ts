import { Module } from '@nestjs/common';
import { PreciosTapeteMaterialService } from './precios-tapete-material.service';
import { PreciosTapeteMaterialController } from './precios-tapete-material.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MatMaterialPrices, MatMaterialPricesSchema } from './precios-tapete-material.schema';
import { ProductsModule } from '../products/products.module';

@Module({

  imports: [
    MongooseModule.forFeature([{ name: MatMaterialPrices.name, schema: MatMaterialPricesSchema }]),
    ProductsModule
  ],
  providers: [PreciosTapeteMaterialService],
  controllers: [PreciosTapeteMaterialController],
  exports: [PreciosTapeteMaterialService],
})
export class PreciosTapeteMaterialModule { }
