import { Module } from '@nestjs/common';
import { WoocommerceService } from './woocommerce.service';
import { WoocommerceController } from './woocommerce.controller';

@Module({
  providers: [WoocommerceService],
  controllers: [WoocommerceController]
})
export class WoocommerceModule {}
