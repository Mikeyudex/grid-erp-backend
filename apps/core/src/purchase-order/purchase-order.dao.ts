import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryOptions } from 'mongoose';
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

    async findPaginated(page: number, limit: number, options?: QueryOptions): Promise<(FlattenMaps<PurchaseOrderDocument> & Required<{ _id: FlattenMaps<unknown>; }>)[]> {
        return this.model.find(options)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('clientId')
            .exec();
    }

    async findFromViewProduction(page: number, limit: number, options?: QueryOptions): Promise<PurchaseOrderDocument[]> {
        return this.model.find(options)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('clientId')
            .lean();
    }
}