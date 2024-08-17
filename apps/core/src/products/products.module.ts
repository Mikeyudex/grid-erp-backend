import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './product.schema';
import { AttributeConfigSchema } from './attribute-config.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductCategorySchema } from './category/category.schema';
import { ProductSubCategorySchema } from './subcategory/subcategory.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
        MongooseModule.forFeature([{ name: 'AttributeConfig', schema: AttributeConfigSchema }]),
        MongooseModule.forFeature([{ name: 'ProductCategory', schema: ProductCategorySchema }]),
        MongooseModule.forFeature([{ name: 'ProductSubCategory', schema: ProductSubCategorySchema }]),
      ],
      controllers:[ProductsController],
      providers:[ProductsService]
})
export class ProductsModule {}
