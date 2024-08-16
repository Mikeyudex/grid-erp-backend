import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel('Company') private readonly companyModel: Model<Company>,
    ) { }

    async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
        const newCompany = new this.companyModel(createCompanyDto);
        return newCompany.save();
    }

    async findAll(): Promise<Company[]> {
        let companys = this.companyModel.find().exec();
        return companys;
    }

    async findOne(id: string): Promise<Company> {
        const company = await this.companyModel.findOne({ uuid: id }).exec();
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }

    async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<boolean> {
        const updateCompany = await this.companyModel.updateOne({ uuid: id }, updateCompanyDto, { new: true }).exec();
        if (!updateCompany) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const deletedProduct = await this.companyModel.deleteOne({ uuid: id }).exec();
        if (!deletedProduct) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return true;
    }

}
