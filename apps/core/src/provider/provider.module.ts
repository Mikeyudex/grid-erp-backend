import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderErpSchema } from './provider.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'ProviderErp', schema: ProviderErpSchema }]),
  ],
  providers: [ProviderService],
  controllers: [ProviderController],
  exports:[ProviderService]
})
export class ProviderModule {}
