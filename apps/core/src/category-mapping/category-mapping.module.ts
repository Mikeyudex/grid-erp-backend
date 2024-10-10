import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CategoryMappingService } from './category-mapping.service';
import { CategoryMappingController } from './category-mapping.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryMapping, CategoryMappingSchema } from './category-mapping.schema';
import { CategoryMappingValidationMiddleware } from './middlewares/category-mapping-validation.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: CategoryMapping.name, schema: CategoryMappingSchema }]),],
  providers: [CategoryMappingService],
  controllers: [CategoryMappingController]
})
export class CategoryMappingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CategoryMappingValidationMiddleware)
      .forRoutes(
        { path: 'category-mapping/create', method: RequestMethod.POST },
      );
  }
}
