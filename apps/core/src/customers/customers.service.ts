import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CustomerDAO } from './dao/customer.dao';
import { CreateCustomerDto } from './dtos/customer.dto';
import { CustomerDocument } from './customers.schema';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class CustomersService {

    constructor(
        private readonly customerDao: CustomerDAO
    ) { }

    async create(customer: CreateCustomerDto) {
        try {
            let customerDocument = await this.customerDao.create(customer);
            return ApiResponse.success('Cliente creado con éxito', customerDocument.toJSON(), HttpStatus.CREATED);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async getAll(page: number, limit: number) {
        try {
            let customers = await this.customerDao.findPaginated(page, limit);
            return ApiResponse.success('Clientes obtenidos con éxito', customers);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}       
