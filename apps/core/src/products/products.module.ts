import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { AttributeConfig, AttributeConfigSchema } from './attribute-config.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductCategory, ProductCategorySchema } from './category/category.schema';
import { ProductSubCategory, ProductSubCategorySchema } from './subcategory/subcategory.schema';
import { StockModule } from '../stock/stock.module';
import { UnitOfMeasureModule } from '../unit-of-measure/unit-of-measure.module';
import { OracleCloudModule } from '../oracle-cloud.module';
import { ProductValidationMiddleware } from './middlewares/product-validation.middleware';
import { SettingsModule } from '../settings/settings.module';
import { TaxesModule } from '../taxes/taxes.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { MovementModule } from '../movement/movement.module';
import { TypeProduct, TypeProductSchema } from './typeProduct/typeProduct.schema';
import { WoocommerceModule } from '../woocommerce/woocommerce.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: AttributeConfig.name, schema: AttributeConfigSchema }]),
    MongooseModule.forFeature([{ name: ProductCategory.name, schema: ProductCategorySchema }]),
    MongooseModule.forFeature([{ name: ProductSubCategory.name, schema: ProductSubCategorySchema }]),
    MongooseModule.forFeature([{ name: TypeProduct.name, schema: TypeProductSchema }]),
    StockModule,
    UnitOfMeasureModule,
    OracleCloudModule,
    SettingsModule,
    TaxesModule,
    WarehouseModule,
    MovementModule,
    WoocommerceModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [MongooseModule, ProductsService]
})

export class ProductsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProductValidationMiddleware)
      .forRoutes({ path: 'products/create', method: RequestMethod.POST });
  }
}
