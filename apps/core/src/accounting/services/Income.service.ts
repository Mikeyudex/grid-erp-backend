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

}