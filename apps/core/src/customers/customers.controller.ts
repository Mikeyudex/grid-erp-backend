import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dtos/customer.dto';

@Controller('customers')
export class CustomersController {

    constructor(private readonly customersService: CustomersService) { }

    @Post('create')
    async create(@Body() createCustomer: CreateCustomerDto) {
        return this.customersService.create(createCustomer);
    }

    @Get('getAll')
    async getAll(@Param('page') page: number, @Param('limit') limit: number) {
        return this.customersService.getAll(page, limit);
    }

}
