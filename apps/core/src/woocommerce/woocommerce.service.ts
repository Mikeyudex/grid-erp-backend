import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWoocommerceDto, UpdateWoocommerceDto } from './dto/woocommerce.dto';
import { Woocommerce } from './woocommerce.schema';

@Injectable()
export class WoocommerceService {
    constructor(
        @InjectModel('Woocommerce') private readonly woocommerceModel: Model<Woocommerce>,
    ) { }

    async create(createWoocommerceDto: CreateWoocommerceDto): Promise<Woocommerce> {
        let woo = await this.woocommerceModel.findOne({ companyId: createWoocommerceDto.companyId }).exec();
        if (woo) {
            throw new BadRequestException('Ya existen registros con la misma empresa');
        }
        const newWoo = new this.woocommerceModel(createWoocommerceDto);
        return newWoo.save();
    }

    async findAll(): Promise<Woocommerce[]> {
        let results = this.woocommerceModel.find().exec();
        return results;
    }

    async findOne(id: string): Promise<Woocommerce> {
        const result = await this.woocommerceModel.findOne({ uuid: id }).exec();
        if (!result) {
            throw new NotFoundException(`Result with ID ${id} not found`);
        }
        return result;
    }

    async findByCompanyId(companyId: string): Promise<Woocommerce> {
        const result = await this.woocommerceModel.findOne({ companyId: companyId }).exec();
        if (!result) {
            throw new NotFoundException(`Result with companyId ${companyId} not found`);
        }
        return result;
    }

    async update(id: string, updateWoocommerceDto: UpdateWoocommerceDto): Promise<boolean> {
        const updateWoo = await this.woocommerceModel.findByIdAndUpdate(id, updateWoocommerceDto, { new: true }).exec();
        if (!updateWoo) {
            throw new NotFoundException(`Result with ID ${id} not found`);
        }
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const deletedWoo = await this.woocommerceModel.findByIdAndDelete(id).exec();
        if (!deletedWoo) {
            throw new NotFoundException(`Result with ID ${id} not found`);
        }
        return true;
    }

}

