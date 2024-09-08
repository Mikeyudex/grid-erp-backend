import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MovementService } from './movement.service';
import { MovementController } from './movement.controller';
import { StockModule } from '../stock/stock.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MovementSchema, Movement } from './movement.schema';
import { MovementValidationMiddleware } from './middlewares/movement-validation.middleware';

@Module({
  imports:[
    StockModule,
    MongooseModule.forFeature([{ name: Movement.name, schema: MovementSchema }]),
  ],
  providers: [MovementService],
  controllers: [MovementController],
  exports:[MovementService, MongooseModule]
})
export class MovementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MovementValidationMiddleware)
      .forRoutes({ path: 'movements/create', method: RequestMethod.POST });
  }
}
