import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnitOfMeasure, UnitOfMeasureDocument } from './unit-of-measure.schema';
import { CreateUnitOfMeasureDto } from './dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from './dto/update-unit-of-measure.dto';

@Injectable()
export class UnitOfMeasureService {
  constructor(
    @InjectModel(UnitOfMeasure.name) private readonly unitOfMeasureModel: Model<UnitOfMeasureDocument>,
  ) { }

  // Crear una nueva unidad de medida
  async create(createUnitOfMeasureDto: CreateUnitOfMeasureDto): Promise<UnitOfMeasure> {
    const createdUnitOfMeasure = new this.unitOfMeasureModel(createUnitOfMeasureDto);
    return createdUnitOfMeasure.save();
  }

  // Obtener todas las unidades de medida
  async findAll(): Promise<UnitOfMeasure[]> {
    return this.unitOfMeasureModel.find().exec();
  }

  // Obtener una unidad de medida por ID
  async findOne(id: string): Promise<UnitOfMeasureDocument> {
    const unit = await this.unitOfMeasureModel.findById(id).exec();
    if (!unit) {
      throw new NotFoundException(`Unit of Measure with ID ${id} not found`);
    }
    return unit;
  }

  async getIdFromShortCode(value: string): Promise<string> {
    try {
      let unitOfMeasureId = await this.unitOfMeasureModel.findOne({ shortCode: value }).lean();
      if (!unitOfMeasureId) {
        throw new NotFoundException(`Unit of Measure with ShortCode ${value} not found`);
      }
      return unitOfMeasureId._id.toString();
    } catch (error) {
      throw new NotFoundException(`Unit of Measure with ShortCode ${value} not found`);
    }
  }

  // Actualizar una unidad de medida por ID
  async update(id: string, updateUnitOfMeasureDto: UpdateUnitOfMeasureDto): Promise<UnitOfMeasure> {
    const updatedUnit = await this.unitOfMeasureModel.findByIdAndUpdate(id, updateUnitOfMeasureDto, { new: true }).exec();
    if (!updatedUnit) {
      throw new NotFoundException(`Unit of Measure with ID ${id} not found`);
    }
    return updatedUnit;
  }

  // Eliminar una unidad de medida por ID
  async remove(id: string): Promise<void> {
    const result = await this.unitOfMeasureModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Unit of Measure with ID ${id} not found`);
    }
  }
}
