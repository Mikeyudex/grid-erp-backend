import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { Resource, ResourceSchema } from './resource.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourceValidationMiddleware } from './middlewares/resource.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resource.name, schema: ResourceSchema}]),
  ],
  providers: [ResourceService],
  controllers: [ResourceController],
  exports: [ResourceService],
})
export class ResourceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ResourceValidationMiddleware)
      .forRoutes({path: 'resources/create', method: RequestMethod.POST });
  }
}
