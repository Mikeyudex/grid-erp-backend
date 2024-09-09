// stock-adjustment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { StockAdjustment, StockAdjustmentDocument, TypeAdjustment } from './stock-adjustment.schema';
import { Stock } from '../stock/stock.schema';
import { Movement, TypeMovementEnum } from '../movement/movement.schema';
import { CreateStockAdjustmentDto } from './dto/stock-adjustment.dto';

@Injectable()
export class StockAdjustmentService {
    constructor(
        @InjectModel(StockAdjustment.name)
        private readonly stockAdjustmentModel: Model<StockAdjustmentDocument>,
        @InjectModel('Stock')
        private readonly stockModel: Model<Stock>,
        @InjectModel('Movement')
        private readonly movementModel: Model<Movement>,
    ) { }

    // Obtener ajustes recientes
    async getRecentAdjustments(page: number = 1, limit: number = 10, companyId: string) {
        const skip = (page - 1) * limit;
        return this.stockAdjustmentModel
            .find({ companyId: companyId })
            .sort({ adjustmentDate: -1 })// Ordenar por fecha descendente
            .skip(skip)
            .limit(limit)
            .populate('warehouseId') // Opcional: para mostrar detalles de la bodega
            .exec();
    }

    // Método para crear un ajuste de stock
    async createStockAdjustment(createStockAdjustmentDto: CreateStockAdjustmentDto): Promise<StockAdjustment> {
        const session: ClientSession = await this.stockAdjustmentModel.db.startSession();
        session.startTransaction();
        try {
            const { productId, quantity, adjustmentType } = createStockAdjustmentDto;

            // Buscar el stock actual del producto
            const stock = await this.stockModel.findOne({ productId });

            if (!stock) {
                throw new NotFoundException('No se encontró stock para el producto.');
            }

            // Ajustar el stock según el tipo de ajuste
            if (adjustmentType === TypeAdjustment.I) {
                stock.quantity += quantity;
            } else if (adjustmentType === TypeAdjustment.D) {
                if (stock.quantity < quantity) {
                    throw new Error('Insufficient stock to perform adjustment.');
                }
                stock.quantity -= quantity;
            }

            // Guardar el ajuste en la colección de ajustes de stock
            const newAdjustment = new this.stockAdjustmentModel(createStockAdjustmentDto);
            await newAdjustment.save();

            // Actualizar el stock en la base de datos
            await stock.save();

            // Crear un movimiento de ajuste
            await this.handleCreateMovement(createStockAdjustmentDto);

            return newAdjustment;
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
    }

    async handleCreateMovement(createStockAdjustmentDto: CreateStockAdjustmentDto): Promise<void> {
        try {
            const { quantity, warehouseId, note, createdBy, productId } = createStockAdjustmentDto;
            let createMovementDto = {
                warehouseId: warehouseId,
                productId: productId,
                type: TypeMovementEnum.A,
                quantity: quantity,
                reason: note,
                createdBy: createdBy
            }
            let movement = new this.movementModel(createMovementDto);
            await movement.save();
            return;
        } catch (error) {
            throw error;
        }
    }
}
