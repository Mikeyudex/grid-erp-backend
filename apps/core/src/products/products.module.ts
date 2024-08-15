import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './product.schema';
import { AttributeConfigSchema } from './attribute-config.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
        MongooseModule.forFeature([{ name: 'AttributeConfig', schema: AttributeConfigSchema }]),
      ],
      controllers:[ProductsController],
      providers:[ProductsService]
})
export class ProductsModule {}
