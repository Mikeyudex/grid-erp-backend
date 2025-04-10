import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DAO } from '../database/database.dao';
import { PurchaseOrder, PurchaseOrderDocument } from './purchase-order.schema';

@Injectable()
export class PurchaseOrderDAO extends DAO<PurchaseOrderDocument> {
    logging = new Logger(PurchaseOrderDAO.name);

    constructor(
        @InjectModel(PurchaseOrder.name) model: Model<PurchaseOrderDocument>
    ) {
        super(model);
    }
}