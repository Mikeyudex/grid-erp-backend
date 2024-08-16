import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreController } from './core.controller';
import { CoreService } from './core.service';
import { ProductsModule } from './products/products.module';
import { globalConfigs } from 'configs';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    ProductsModule,
    MongooseModule.forRoot(globalConfigs.MONGODB_URI),
    CompanyModule,
  ],
  controllers: [CoreController],
  providers: [CoreService],
})
export class CoreModule {}
