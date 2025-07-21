import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Income, IncomeDocument } from "../schemas/income.schema";
import { CreateIncomeDto } from "../dtos/income.dto";

export class IncomeService {

    constructor(
        @InjectModel(Income.name) private readonly incomeModel: Model<IncomeDocument>,
    ) { }

    async create(createIncomeDto: CreateIncomeDto): Promise<IncomeDocument> {
        try {
            let incomeDocument = await this.incomeModel.create(createIncomeDto);
            return incomeDocument;
        } catch (error) {
            throw new Error(`Error creating income: ${error.message}`);
        }
    }

    async updatePurchaseOrderId(ids:Types.ObjectId[], purchaseOrderId:unknown) {
        try {
            let updated = await this.incomeModel.updateMany(
                { _id: { $in: ids } },
                { $set: { purchaseOrderId: purchaseOrderId } }
            );
            return updated;
        } catch (error) {
            throw new Error(`Error updating income: ${error.message}`);
        }
    }

}