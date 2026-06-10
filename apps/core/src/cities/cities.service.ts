import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City, CityDocument } from './city.schema';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(City.name) private readonly cityModel: Model<CityDocument>,
  ) { }

  async findAll(search?: string) {
    try {
      if (search) {
        // Búsqueda case-insensitive por nombre
        const regex = new RegExp(search, 'i');
        return await this.cityModel.find({ name: { $regex: regex } }).limit(50).exec();
      }
      return await this.cityModel.find().limit(50).exec();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener las ciudades');
    }
  }

  async create(createCityDto: any) {
    try {
      const newCity = new this.cityModel(createCityDto);
      return await newCity.save();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al crear la ciudad');
    }
  }

  async update(id: string, updateCityDto: any) {
    try {
      updateCityDto.updatedAt = getCurrentUTCDate();
      const updatedCity = await this.cityModel.findByIdAndUpdate(id, updateCityDto, { new: true }).exec();
      if (!updatedCity) {
        throw new NotFoundException(`Ciudad con ID ${id} no encontrada`);
      }
      return updatedCity;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Error al actualizar la ciudad');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.cityModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Ciudad con ID ${id} no encontrada`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar la ciudad');
    }
  }
}
