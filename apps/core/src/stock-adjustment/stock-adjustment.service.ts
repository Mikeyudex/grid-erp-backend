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

    // Obtener ajustes recientes de stock
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
            const { products } = createStockAdjustmentDto;

            let totalAdjustedValue = 0;

            const adjustments = products.map(product => {
                const { oldQuantity, newQuantity, costPrice } = product;
                const adjustedQuantity = newQuantity - oldQuantity;
                totalAdjustedValue += adjustedQuantity * costPrice;

                return {
                    productId: product.productId,
                    oldQuantity,
                    newQuantity,
                    adjustedQuantity: adjustedQuantity,
                    costPrice: costPrice
                };
            });

            createStockAdjustmentDto.products = adjustments;

            // Guardar el ajuste en la colección de ajustes de stock
            const newAdjustment = new this.stockAdjustmentModel(createStockAdjustmentDto);
            await newAdjustment.save();

            // Crear movimientos de ajuste
            await this.handleCreateMovement(createStockAdjustmentDto);

            // Actualizar stock de los productos
            await this.updateProductStock(products);

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
            const { warehouseId, note, createdBy, products } = createStockAdjustmentDto;

            for (const product of products) {
             
                let createMovementDto = {
                    warehouseId: warehouseId,
                    productId: product.productId,
                    type: TypeMovementEnum.A,
                    quantity: product.newQuantity - product.oldQuantity,
                    reason: note,
                    createdBy: createdBy
                }
                let movement = new this.movementModel(createMovementDto);
                await movement.save();
            }
        } catch (error) {
            throw error;
        }
    }

    async updateProductStock(products: any[]): Promise<void> {
        try {
            for (const product of products) {
                const { productId, newQuantity } = product;

                await this.stockModel.findOneAndUpdate(
                    { productId: productId },
                    { $set: { quantity: newQuantity } },
                    { new: true }
                );
            }
        } catch (error) {
            throw error;
        }
    }
}
