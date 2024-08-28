import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tax, TaxDocument } from './taxes.schema';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxesService {
    private companyId: string;

    constructor(
        @InjectModel(Tax.name) private readonly taxModel: Model<TaxDocument>,
    ) { this.companyId = "3423f065-bb88-4cc5-b53a-63290b960c1a" }

    async create(createTaxDto: CreateTaxDto): Promise<TaxDocument> {
        createTaxDto.companyId = this.companyId;
        const createdTax = new this.taxModel(createTaxDto);
        return createdTax.save();
    }

    async findAll(): Promise<TaxDocument[]> {
        return this.taxModel.find().exec();
    }

    async findAllByCompany(): Promise<TaxDocument[]> {
        return this.taxModel.find({companyId: this.companyId}).exec();
    }

    async findOne(id: string): Promise<TaxDocument> {
        const tax = await this.taxModel.findById(id).exec();
        if (!tax) {
            throw new NotFoundException(`Tax with ID ${id} not found`);
        }
        return tax;
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
