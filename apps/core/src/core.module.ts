import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreController } from './core.controller';
import { CoreService } from './core.service';
import { ProductsModule } from './products/products.module';
import { globalConfigs } from 'configs';
import { CompanyModule } from './company/company.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ProviderModule } from './provider/provider.module';

@Module({
  imports: [
    CompanyModule,
    ProductsModule,
    MongooseModule.forRoot(globalConfigs.MONGODB_URI),
    CompanyModule,
    WarehouseModule,
    ProviderModule
  ],
  controllers: [CoreController],
  providers: [CoreService],
})
export class CoreModule {}
