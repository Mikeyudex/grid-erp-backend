import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatMaterialPrices, MatMaterialPricesDocument } from './precios-tapete-material.schema';
import { ProductsService } from '../products/products.service';
import { ApiResponse } from '../common/api-response';
import { CreatePrecioTapeteMaterialDto, UpdatePrecioTapeteMaterialDto } from './precios-tapete-material.dto';
import { CustomersService } from '../customers/customers.service';


@Injectable()
export class PreciosTapeteMaterialService {
    logger = new Logger(PreciosTapeteMaterialService.name);

    constructor(
        @InjectModel(MatMaterialPrices.name) private readonly matMaterialPricesModel: Model<MatMaterialPricesDocument>,
        private readonly productsServicee: ProductsService,
        private readonly customersServicee: CustomersService
    ) { }

    async findAll(): Promise<MatMaterialPrices[]> {
        return this.matMaterialPricesModel.find().exec();
    }

    async findOne(id: string): Promise<MatMaterialPrices> {
        return this.matMaterialPricesModel.findById(id).exec();
    }

    async create(createPrecioTapeteMaterialDto: CreatePrecioTapeteMaterialDto): Promise<MatMaterialPricesDocument> {
        return this.matMaterialPricesModel.create(createPrecioTapeteMaterialDto);
    }

    async update(id: string, updatePrecioTapeteMaterialDto: UpdatePrecioTapeteMaterialDto): Promise<MatMaterialPricesDocument> {
        return this.matMaterialPricesModel.findByIdAndUpdate(id, updatePrecioTapeteMaterialDto, { new: true }).exec();
    }

    async delete(id: string): Promise<MatMaterialPricesDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new InternalServerErrorException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'id no es un ObjectId válido',
            });
        }
        let idCasted = new Types.ObjectId(id);
        return this.matMaterialPricesModel.findByIdAndDelete(idCasted).exec();
    }

    async calcularFactorAjuste(material: string, tipoTapete: string): Promise<number> {
        try {
            let data = await this.matMaterialPricesModel.find().exec();

            // Obtener el precio de "ESTÁNDAR A" con el mismo material
            const precioBase = data.filter((item) => item.tipo_tapete === 'ESTÁNDAR A' && item.tipo_material === material)[0];

            const precioSeleccionado = data.filter((item) => item.tipo_tapete === tipoTapete && item.tipo_material === material)[0];

            if (!precioBase || !precioSeleccionado) return 0;

            // Calcular factor de ajuste
            return precioSeleccionado.precioBase / precioBase.precioBase;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async retornaPrecioBaseMatMaterial(material: string, tipoTapete: string): Promise<number> {
        try {
            let data = await this.matMaterialPricesModel.find().exec();
            const precioSeleccionado = data.filter((item) => item.tipo_tapete === tipoTapete && item.tipo_material === material)[0];
            return precioSeleccionado.precioBase;
        } catch (error) {
            throw new Error(error);
        }
    }

    async calcularPrecioFinal(productId: string, tipoTapete: string, material: string, cantidad: number, typeCustomerId: string) {
        try {
            if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(typeCustomerId)) {
                throw new InternalServerErrorException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'productId o typeCustomerId no es un ObjectId válido',
                });
            }
            let productIdCasted = new Types.ObjectId(productId);
            const producto = await this.productsServicee.findOne(productIdCasted);

            if (!producto) return 0;

            let typeCustomerData = await this.customersServicee.getTypeCustomerById(typeCustomerId);

            //Se valida que el tipo de material seleccionado aplique para ajuste de precio
            let tipoMaterialNoAplican = ["PR-KANT ADH", "PR-BEIGE LISO", "PR-BEIGE ADH", "PR-ALFOMBRA"];

            if (tipoMaterialNoAplican.includes(material)) {
                try {
                    const precioBase = await this.retornaPrecioBaseMatMaterial(material, tipoTapete);
                    const precioFinal = precioBase * cantidad;
                    if (typeCustomerData.percentDiscount > 0) {
                        const discount = Math.round((precioFinal * typeCustomerData.percentDiscount) / 100);
                        return ApiResponse.success('Precio final calculado correctamente con descuento', { precioFinal: precioFinal - discount }, HttpStatus.OK);
                    }
                    return ApiResponse.success('Precio final calculado correctamente', { precioFinal }, HttpStatus.OK);
                } catch (error) {
                    this.logger.error('Error al calcular el precio final', error);
                    return ApiResponse.success('Precio final calculado correctamente', { precioFinal: producto.salePrice, errorMessage: error }, HttpStatus.OK);
                }
            }

            const factorAjuste = await this.calcularFactorAjuste(material, tipoTapete);
            if (!factorAjuste) return 0;

            const precioAjustado = Math.round(producto.salePrice * factorAjuste / 1000) * 1000;
            const precioFinal = precioAjustado * cantidad;
            if (typeCustomerData.percentDiscount > 0) {
                const discount = Math.round((precioFinal * typeCustomerData.percentDiscount) / 100);
                return ApiResponse.success('Precio final calculado correctamente con descuento', { precioFinal: precioFinal - discount }, HttpStatus.OK);
            }
            return ApiResponse.success('Precio final calculado correctamente', { precioFinal }, HttpStatus.OK);
        } catch (error) {
            this.logger.error('Error al calcular el precio final', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }

    }

    async calcularPrecioFinalDesdePrecioBase(basePrice: string, tipoTapete: string, material: string, cantidad: number, typeCustomerId: string) {

        try {
            if (!Types.ObjectId.isValid(typeCustomerId)) {
                throw new InternalServerErrorException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'typeCustomerId no es un ObjectId válido',
                });
            }
            let salePrice = parseInt(basePrice);
            let typeCustomerData = await this.customersServicee.getTypeCustomerById(typeCustomerId);

            //Se valida que el tipo de material seleccionado aplique para ajuste de precio
            let tipoMaterialNoAplican = ["PR-KANT ADH", "PR-BEIGE LISO", "PR-BEIGE ADH", "PR-ALFOMBRA"];

            if (tipoMaterialNoAplican.includes(material)) {
                try {
                    const precioBase = await this.retornaPrecioBaseMatMaterial(material, tipoTapete);
                    const precioFinal = precioBase * cantidad;
                    if (typeCustomerData.percentDiscount > 0) {
                        const discount = Math.round((precioFinal * typeCustomerData.percentDiscount) / 100);
                        return ApiResponse.success('Precio final calculado correctamente con descuento', { precioFinal: precioFinal - discount }, HttpStatus.OK);
                    }
                    return ApiResponse.success('Precio final calculado correctamente', { precioFinal }, HttpStatus.OK);
                } catch (error) {
                    this.logger.error('Error al calcular el precio final', error);
                    return ApiResponse.success('Precio final calculado correctamente', { precioFinal: salePrice, errorMessage: error }, HttpStatus.OK);
                }
            }

            const factorAjuste = await this.calcularFactorAjuste(material, tipoTapete);
            if (!factorAjuste) return 0;

            const precioAjustado = Math.round(salePrice * factorAjuste / 1000) * 1000;
            const precioFinal = precioAjustado * cantidad;
            if (typeCustomerData.percentDiscount > 0) {
                const discount = Math.round((precioFinal * typeCustomerData.percentDiscount) / 100);
                return ApiResponse.success('Precio final calculado correctamente con descuento', { precioFinal: precioFinal - discount }, HttpStatus.OK);
            }
            return ApiResponse.success('Precio final calculado correctamente', { precioFinal }, HttpStatus.OK);

        } catch (error) {
            this.logger.error('Error al calcular el precio final', error);
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }
}
