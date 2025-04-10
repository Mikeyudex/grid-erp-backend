import { Module } from '@nestjs/common';
import { PreciosTapeteMaterialService } from './precios-tapete-material.service';
import { PreciosTapeteMaterialController } from './precios-tapete-material.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MatMaterialPrices, MatMaterialPricesSchema } from './precios-tapete-material.schema';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';

@Module({

  imports: [
    MongooseModule.forFeature([{ name: MatMaterialPrices.name, schema: MatMaterialPricesSchema }]),
    ProductsModule,
    CustomersModule,
  ],
  providers: [PreciosTapeteMaterialService],
  controllers: [PreciosTapeteMaterialController],
  exports: [PreciosTapeteMaterialService],
})
export class PreciosTapeteMaterialModule { }
