import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dtos/customer.dto';
import { CreateTypesCustomerDto } from './dtos/types-customer.dto';

@Controller('customers')
export class CustomersController {

    constructor(private readonly customersService: CustomersService) { }

    @Post('create')
    async create(@Body() createCustomer: CreateCustomerDto) {
        return this.customersService.create(createCustomer);
    }

    @Get('getAll')
    async getAll(@Query('page') page: number, @Query('limit') limit: number) {
        return this.customersService.getAll(page, limit);
    }

    @Get('getAllByFields')
    async getAllByFields(@Query('page') page: number, @Query('limit') limit: number, @Query('fields') fields: string) {
        let fieldsArray = fields.split(',');
        return this.customersService.getAllByFields(page, limit, fieldsArray);
    }
    
    @Get('getTypes')
    async typesCustomer() {
        return this.customersService.getAllTypeCustomers();
    }

    @Post('createTypeCustomer')
    async createTypeCustomer(@Body() createTypesCustomer: CreateTypesCustomerDto) {
        return this.customersService.createTypeCustomer(createTypesCustomer);
    }

}
