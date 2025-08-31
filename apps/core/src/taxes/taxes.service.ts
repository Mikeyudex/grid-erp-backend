import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tax, TaxDocument } from './taxes.schema';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxesService {
    constructor(
        @InjectModel(Tax.name) private readonly taxModel: Model<TaxDocument>,
    ) { }

    async create(createTaxDto: CreateTaxDto): Promise<TaxDocument> {
        createTaxDto.companyId = new Types.ObjectId(createTaxDto.companyId);
        const createdTax = new this.taxModel(createTaxDto);
        return createdTax.save();
    }

    async findAll(): Promise<TaxDocument[]> {
        return this.taxModel.find().exec();
    }

    async findAllByCompany(companyId: string): Promise<TaxDocument[]> {
        let castedCompanyId = new Types.ObjectId(companyId);
        if (!Types.ObjectId.isValid(castedCompanyId)) {
            throw new NotFoundException(`Invalid ID: ${companyId}`);
        }
        return this.taxModel.find({ companyId: castedCompanyId }).exec();
    }


    async findOne(id: string): Promise<TaxDocument> {
        let castedId = new Types.ObjectId(id);
        if (!Types.ObjectId.isValid(castedId)) {
            throw new NotFoundException(`Invalid ID: ${id}`);
        }
        const tax = await this.taxModel.findById(castedId).exec();
        if (!tax) {
            throw new NotFoundException(`Tax with ID ${id} not found`);
        }
        return tax;
    }

    async getIdFromShortCode(value: string): Promise<string> {
        try {
            let tax = await this.taxModel.findOne({ shortCode: value }).lean();
            if (!tax) {
                throw new NotFoundException(`Tax with ShortCode ${value} not found`);
            }
            return tax._id.toString();
        } catch (error) {
            throw new NotFoundException(`Tax with ShortCode ${value} not found`);
        }
    }

    async update(id: string, updateTaxDto: UpdateTaxDto): Promise<TaxDocument> {
        const updatedTax = await this.taxModel.findByIdAndUpdate(id, updateTaxDto, { new: true }).exec();
        if (!updatedTax) {
            throw new NotFoundException(`Tax with ID ${id} not found`);
        }
        return updatedTax;
    }

    async remove(id: string): Promise<void> {
        const result = await this.taxModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Tax with ID ${id} not found`);
        }
    }

}
