import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer, CustomerSchema } from './customers.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerDAO } from './dao/customer.dao';
import { CustomerValidationMiddleware } from './middlewares/customer.middleware';
import { TypeCustomer, TypeCustomerSchema } from './typeCustomer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }]),
    MongooseModule.forFeature([{ name: TypeCustomer.name, schema: TypeCustomerSchema }]),
  ],
  providers: [CustomersService, CustomerDAO],
  controllers: [CustomersController],
  exports: [CustomersService, CustomerDAO]
})
export class CustomersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CustomerValidationMiddleware)
      .forRoutes({ path: 'customers/create', method: RequestMethod.POST });
  }
}
