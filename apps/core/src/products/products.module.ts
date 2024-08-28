import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './product.schema';
import { AttributeConfigSchema } from './attribute-config.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductCategorySchema } from './category/category.schema';
import { ProductSubCategorySchema } from './subcategory/subcategory.schema';
import { StockModule } from '../stock/stock.module';
import { UnitOfMeasureModule } from '../unit-of-measure/unit-of-measure.module';
import { OracleCloudModule } from '../oracle-cloud.module';
import { ProductValidationMiddleware } from './middlewares/product-validation.middleware';
import { SettingsModule } from '../settings/settings.module';
import { TaxesModule } from '../taxes/taxes.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
        MongooseModule.forFeature([{ name: 'AttributeConfig', schema: AttributeConfigSchema }]),
        MongooseModule.forFeature([{ name: 'ProductCategory', schema: ProductCategorySchema }]),
        MongooseModule.forFeature([{ name: 'ProductSubCategory', schema: ProductSubCategorySchema }]),
        StockModule,
        UnitOfMeasureModule, 
        OracleCloudModule,
        SettingsModule,
        TaxesModule
      ],
      controllers:[ProductsController],
      providers:[ProductsService]
})

export class ProductsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProductValidationMiddleware)
      .forRoutes({ path: 'products/create', method: RequestMethod.POST });
  }
}
