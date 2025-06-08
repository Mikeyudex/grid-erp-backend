import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { PaymentMethod, PaymentMethodDocument } from "../schemas/paymentMethod.schema";
import { InternalServerErrorException } from "@nestjs/common";
import { ApiResponse } from "../../common/api-response";
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from "../dtos/paymentMethod.dto";


export class PaymentMethodService {

    constructor(
        @InjectModel(PaymentMethod.name) private readonly paymentMethodModel: Model<PaymentMethodDocument>,
    ) { }

    async findAll() {
        try {
            let paymentMethods = await this.paymentMethodModel.find().lean().exec();
            return ApiResponse.success('Registros obtenidos con éxito', paymentMethods);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async findById(id: string) {
        try {
            let paymentMethod = await this.paymentMethodModel.findById(id).lean().exec();
            return ApiResponse.success('Registros obtenidos con éxito', paymentMethod);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async create(createPaymentMethodDto: CreatePaymentMethodDto) {
        try {
            let paymentMethodDocument = await this.paymentMethodModel.create(createPaymentMethodDto);
            return ApiResponse.success('Registros obtenidos con éxito', paymentMethodDocument);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto) {
        try {
            let castedId = new Types.ObjectId(id);
            let paymentMethod = await this.paymentMethodModel.findByIdAndUpdate(castedId, updatePaymentMethodDto, { new: true });
            return ApiResponse.success('Registros obtenidos con éxito', paymentMethod);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async delete(id: string) {
        try {
            let castedId = new Types.ObjectId(id);
            let paymentMethod = await this.paymentMethodModel.findByIdAndDelete(castedId);
            return ApiResponse.success('Registros obtenidos con éxito', paymentMethod);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async bulkDelete(ids: string[]) {
        try {
            let idsObjectId = ids.map(id => new Types.ObjectId(id));
            let paymentMethod = await this.paymentMethodModel.deleteMany({ _id: { $in: idsObjectId } });
            return ApiResponse.success('Registros obtenidos con éxito', paymentMethod);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }


}

