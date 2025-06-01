import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer, CustomerSchema } from './customers.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerDAO } from './dao/customer.dao';
import { CustomerValidationMiddleware } from './middlewares/customer.middleware';
import { TypeCustomer, TypeCustomerSchema } from './typeCustomer.schema';
import { TypeOfCustomer, TypeOfCustomerSchema } from './schemas/typeOfCustomer.schema';
import { TypeOfDocument, TypeOfDocumentSchema } from './schemas/typeOfDocument.schema';
import { TypeOfCustomerService } from './services/typeOfCustomer.service';
import { TypeOfCustomerController } from './controllers/typeOfCustomer.controller';
import { TypeOfDocumentService } from './services/typeOfDocument.service';
import { TypeOfDocumentController } from './controllers/typeOfDocument.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }]),
    MongooseModule.forFeature([{ name: TypeCustomer.name, schema: TypeCustomerSchema }]),
    MongooseModule.forFeature([{ name: TypeOfCustomer.name, schema: TypeOfCustomerSchema }]),
    MongooseModule.forFeature([{ name: TypeOfDocument.name, schema: TypeOfDocumentSchema }]),
  ],
  providers: [CustomersService, CustomerDAO, TypeOfCustomerService, TypeOfDocumentService],
  controllers: [CustomersController, TypeOfCustomerController, TypeOfDocumentController],
  exports: [CustomersService, CustomerDAO, TypeOfCustomerService, TypeOfDocumentService]
})
export class CustomersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CustomerValidationMiddleware)
      .forRoutes({ path: 'customers/create', method: RequestMethod.POST });
  }
}
