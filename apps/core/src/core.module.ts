import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreController } from './core.controller';
import { CoreService } from './core.service';
import { ProductsModule } from './products/products.module';
import { globalConfigs } from 'configs';

@Module({
  imports: [
    ProductsModule,
    MongooseModule.forRoot(globalConfigs.MONGODB_URI),
  ],
  controllers: [CoreController],
  providers: [CoreService],
})
export class CoreModule {}
