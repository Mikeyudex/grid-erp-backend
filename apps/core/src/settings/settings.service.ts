import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 } from 'uuid';
import { Settings } from './settings.schema';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateValueSettingByKeyDto } from './dto/update-value-settings-byKey.dto';

@Injectable()
export class SettingsService {
    constructor(
        @InjectModel('Settings') private readonly settingsModel: Model<Settings>,
    ) { }

    async create(createSettingsDto: CreateSettingsDto): Promise<Settings> {
        createSettingsDto.uuid = v4();
        const newSetting = new this.settingsModel(createSettingsDto);
        return newSetting.save();
    }

    async findAll(): Promise<Settings[]> {
        return this.settingsModel.find().lean();
    }

    async findAllByCompany(companyId: string): Promise<Settings[]> {
        return this.settingsModel.find({ companyId }).lean();
    }

    async findBySettingName(name: string): Promise<Settings[]> {
        return this.settingsModel.find({ name }).lean();
    }

    async findOne(id: string): Promise<Settings> {
        const setting = await this.settingsModel.findOne({ uuid: id }).lean();
        if (!setting) {
            throw new NotFoundException(`setting with ID ${id} not found`);
        }
        return setting;
    }

    async update(id: string, updateSettingsDto: UpdateSettingsDto): Promise<boolean> {
        const updatedSetting = await this.settingsModel.updateOne({ uuid: id }, updateSettingsDto, { new: true }).exec();
        if (!updatedSetting) {
            throw new NotFoundException(`setting with ID ${id} not found`);
        }
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const deletedSetting = await this.settingsModel.deleteOne({ uuid: id }).exec();
        if (!deletedSetting) {
            throw new NotFoundException(`setting with ID ${id} not found`);
        }
        return true;
    }

    async updateSettingValue(settingId: string, updateValueSettingByKeyDto: UpdateValueSettingByKeyDto) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let { keyToUpdate, newValue } = updateValueSettingByKeyDto;

                // Construir la clave dinámica para la actualización
                const updateKey = `value.$[elem].${keyToUpdate}`;

                // Construir la clave para acceder al valor en el array
                const query = {
                    uuid: settingId,
                    value: { $elemMatch: { [keyToUpdate]: { $exists: true } } }
                };

                const update = {
                    $set: { [updateKey]: newValue }
                };

                const options = {
                    arrayFilters: [{ [`elem.${keyToUpdate}`]: { $exists: true } }],
                    new: true // obtener el documento actualizado como resultado
                };
                const result = await this.settingsModel.findOneAndUpdate(query, update, options);
                if (result) {
                    console.info('[Settings] Valor actualizado correctamente a ' + newValue);
                    resolve(true);
                } else {
                    reject(`Key [${keyToUpdate}] not found`);
                }

            } catch (error: any) {
                console.error(`Error al actualizar el valor: ${error}`);
                reject(error);
            }
        });
    }

    async addValueByName(name: string, companyId: string, payload: Record<string, any>): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const updatedSetting = await this.settingsModel.updateOne({ name, companyId }, { $push: { value: payload } }, { new: true });
            if (!updatedSetting) {
                reject(`setting value with name ${name} not found`);
            }
            resolve(true);
        });
    }

}
