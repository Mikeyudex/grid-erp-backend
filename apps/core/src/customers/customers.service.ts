import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { CustomerDAO } from './dao/customer.dao';
import { CreateCustomerDto } from './dtos/customer.dto';
import { ApiResponse } from '../common/api-response';
import { TypeCustomer, TypeCustomerDocument } from './typeCustomer.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTypesCustomerDto } from './dtos/types-customer.dto';

@Injectable()
export class CustomersService {

    logger = new Logger(CustomersService.name);

    constructor(
        private readonly customerDao: CustomerDAO,
        @InjectModel(TypeCustomer.name) private readonly typeCustomerModel: Model<TypeCustomerDocument>
    ) { }

    async create(customer: CreateCustomerDto) {
        try {
            // Convertir el typeCustomerId a ObjectId antes de guardar
            const customerData = {
                ...customer,
                typeCustomerId: new Types.ObjectId(customer.typeCustomerId),
            };
            let customerDocument = await this.customerDao.create(customerData);
            return ApiResponse.success('Cliente creado con éxito', customerDocument.toJSON(), HttpStatus.CREATED);
        } catch (error) {
            this.logger.error('Error al crear cliente', error);
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

    async getAllTypeCustomers() {
        try {
            let typesCustomer = await this.typeCustomerModel.find().lean().exec();
            return ApiResponse.success('Registros obtenidos con éxito', typesCustomer);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async createTypeCustomer(createTypesCustomer: CreateTypesCustomerDto) {
        try {
            let typeCustomer = await this.typeCustomerModel.create(createTypesCustomer);
            return ApiResponse.success('Tipo de cliente creado con éxito', typeCustomer, HttpStatus.CREATED);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}       
