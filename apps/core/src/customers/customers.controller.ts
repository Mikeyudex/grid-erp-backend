import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dtos/customer.dto';
import { CreateTypesCustomerDto, UpdateTypesCustomerDto } from './dtos/types-customer.dto';

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

    @Put('updateTypeCustomer/:customerId')
    async updateTypeCustomer(@Body() updateTypesCustomer: UpdateTypesCustomerDto, @Param('customerId') customerId: string) {
        return this.customersService.updateTypeCustomer(updateTypesCustomer, customerId);
    }

    @Delete('deleteTypeCustomer/:customerId')
    async deleteTypeCustomer(@Param('customerId') customerId: string) {
        return this.customersService.deleteTypeCustomer(customerId);
    }

    @Delete('typeCustomer/bulkDelete')
    async bulkDeleteTypeCustomer(@Body() payload: Record<string, any>) {
        return this.customersService.bulkDeleteTypeCustomer(payload?.ids);
    }

    @Put('updateCustomer/:customerId')
    async updateCustomer(@Body() updateCustomer: UpdateCustomerDto, @Param('customerId') customerId: string) {
        return this.customersService.updateCustomer(updateCustomer, customerId);
    }

    @Delete('deleteCustomer/:customerId')
    async deleteCustomer(@Param('customerId') customerId: string) {
        return this.customersService.deleteCustomer(customerId);
    }

    @Delete('customer/bulkDelete')
    async bulkDeleteCustomer(@Body() payload: Record<string, any>) {
        return this.customersService.bulkDeleteCustomer(payload?.ids);
    }

}
