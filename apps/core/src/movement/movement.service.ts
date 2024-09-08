// movement.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movement, MovementDocument } from './movement.schema';
import { CreateMovementDto } from './dto/movement.dto';
import { StockService } from '../stock/stock.service'; // Servicio que maneja el stock

@Injectable()
export class MovementService {
    constructor(
        @InjectModel(Movement.name) private movementModel: Model<MovementDocument>,
        private readonly stockService: StockService,
    ) { }

    async create(createMovementDto: CreateMovementDto): Promise<Movement> {
        // Validar y obtener el stock del producto
        const stock = await this.stockService.findOneByProductId(createMovementDto.productId);
        if (!stock) {
            throw new NotFoundException('No se encontró registro de stock para este producto');
        }

        const movement = new this.movementModel(createMovementDto);

        // Actualizar el stock basado en el tipo de movimiento
        if (createMovementDto.type === 'entry') {
            stock.quantity += createMovementDto.quantity;
        } else if (createMovementDto.type === 'exit') {
            if (stock.quantity < createMovementDto.quantity) {
                throw new Error('No hay suficiente stock para esta operación');
            }
            stock.quantity -= createMovementDto.quantity;
        }

        await stock.save();
        return movement.save();
    }

    async getMovementsByProduct(productId: string): Promise<Movement[]> {
        return this.movementModel.find({ productId }).sort({ createdAt: -1 }).exec();
    }

    async calculateStock(productId: string): Promise<number> {
        const stock = await this.stockService.findOneByProductId(productId);
        if (!stock) {
            throw new NotFoundException('No se encontró registro de stock para este producto');
        }
        return stock.quantity;
    }
}
