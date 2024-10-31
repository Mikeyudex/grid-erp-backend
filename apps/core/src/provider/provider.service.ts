import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 } from 'uuid';
import { ProviderErp } from './provider.schema';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProviderService {
    constructor(
        @InjectModel('ProviderErp') private readonly providerErpModel: Model<ProviderErp>,
    ) { }

    async create(createProviderDto: CreateProviderDto): Promise<ProviderErp> {
        createProviderDto.uuid = v4();
        const newProvider = new this.providerErpModel(createProviderDto);
        return newProvider.save();
    }

    async findAll(): Promise<ProviderErp[]> {
        let providers = this.providerErpModel.find().lean();
        return providers;
    }

    async findAllByCompany(companyId: string): Promise<ProviderErp[]> {
        let providers = this.providerErpModel.find({ companyId }).lean();
        return providers;
    }

    async findOne(id: string): Promise<ProviderErp> {
        const provider = await this.providerErpModel.findOne({ uuid: id }).lean();
        if (!provider) {
            throw new NotFoundException(`provider with ID ${id} not found`);
        }
        return provider;
    }

    async getIdFromShortCode(value: string): Promise<string> {
        try {
            let provider = await this.providerErpModel.findOne({ shortCode: value }).lean();
            if (!provider) {
                throw new NotFoundException(`provider with ShortCode ${value} not found`);
            }
            return provider.uuid;
        } catch (error) {
            throw new NotFoundException(`provider with ShortCode ${value} not found`);
        }
    }

    async update(id: string, updateProviderDto: UpdateProviderDto): Promise<boolean> {
        const updatedProvider = await this.providerErpModel.updateOne({ uuid: id }, updateProviderDto, { new: true }).exec();
        if (!updatedProvider) {
            throw new NotFoundException(`Provider with ID ${id} not found`);
        }
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const deletedProvider = await this.providerErpModel.deleteOne({ uuid: id }).exec();
        if (!deletedProvider) {
            throw new NotFoundException(`Provider with ID ${id} not found`);
        }
        return true;
    }

}
