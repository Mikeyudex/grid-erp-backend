import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DAO } from '../../database/database.dao';
import { Customer, CustomerDocument } from '../customers.schema';

@Injectable()
export class CustomerDAO extends DAO<CustomerDocument> {
    logging = new Logger(CustomerDAO.name);

    constructor(
        @InjectModel(Customer.name) model: Model<CustomerDocument>
    ) {
        super(model);
    }
}