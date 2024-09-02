import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { ConfigType } from '@nestjs/config';

import { CoreController } from './core.controller';
import { CoreService } from './core.service';
import { ProductsModule } from './products/products.module';
import { CompanyModule } from './company/company.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ProviderModule } from './provider/provider.module';
import { SettingsModule } from './settings/settings.module';
import { StockModule } from './stock/stock.module';
import { UnitOfMeasureModule } from './unit-of-measure/unit-of-measure.module';
import { TaxesModule } from './taxes/taxes.module';
import { environments } from './environments';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || '.env',
      load: [config],
      isGlobal: true,
      validationSchema:Joi.object({
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        OCI_BUCKET_NAME: Joi.string().required(),
        OCI_REGION: Joi.string().required(),
        API_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      })
    }),
    CompanyModule,
    ProductsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Importa ConfigModule para que ConfigService esté disponible
      useFactory: async (configService: ConfigType<typeof config>) => ({
        uri: configService.database.uri, // Obtiene la URI de las variables de entorno
      }),
      inject: [config.KEY], // Inyecta config.KEY para usarlo en useFactory
    }),
    CompanyModule,
    WarehouseModule,
    ProviderModule,
    SettingsModule,
    StockModule,
    UnitOfMeasureModule,
    TaxesModule,
    AuthModule,
    UsersModule
  ],
  controllers: [CoreController],
  providers: [CoreService],
})
export class CoreModule { }
