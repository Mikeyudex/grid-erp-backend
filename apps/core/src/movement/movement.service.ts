// movement.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movement, MovementDocument, TypeMovementEnum } from './movement.schema';
import { CreateMovementDto, ResponseMovementDto, ResponseTransferDto, ResultDto } from './dto/movement.dto';
import { StockService } from '../stock/stock.service'; // Servicio que maneja el stock
import { CreateStockDto } from '../stock/dto/create-stock.dto';
import { Stock, StockDocument } from '../stock/stock.schema';
import { TypeAdjustment } from '../stock-adjustment/stock-adjustment.schema';

@Injectable()
export class MovementService {
    constructor(
        @InjectModel(Movement.name) private movementModel: Model<MovementDocument>,
        @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
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

    async getAll(page: number, limit: number, companyId: string, type: string): Promise<ResponseMovementDto[]> {
        const skip = (page - 1) * limit;
        let movements = await this.movementModel.find({
            type: { $in: [type] },
            companyId
        })
            .populate('productId')
            .populate('warehouseId')
            .populate('destinationWarehouseId')
            .populate('createdBy')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
            let responseMovements = movements.map((movement : MovementDocument) => {
                let responseMovement = new ResponseMovementDto();
                responseMovement.id = movement._id.toString();
                responseMovement.companyId = movement.companyId;
                responseMovement.warehouseId = (movement.warehouseId as any)._id.toString();
                responseMovement.warehouseName = (movement.warehouseId as any).name;
                responseMovement.destinationWarehouseId = (movement.destinationWarehouseId as any)._id.toString();
                responseMovement.destinationWarehouseName = (movement.destinationWarehouseId as any).name;
                responseMovement.productId = (movement.productId as any)._id.toString();
                responseMovement.productName = (movement.productId as any).name;
                responseMovement.type = movement.type;
                responseMovement.quantity = movement.quantity;
                responseMovement.reason = movement.reason;
                responseMovement.createdById = (movement.createdBy as any)._id.toString();
                responseMovement.createdByName = (movement.createdBy as any).name;
                responseMovement.createdByLastName = (movement.createdBy as any).lastname;
                responseMovement.createdAt = movement.createdAt;
                return responseMovement;
            });
            return responseMovements;
        }

    async calculateStock(productId: string): Promise < number > {
            const stock = await this.stockService.findOneByProductId(productId);
            if(!stock) {
                throw new NotFoundException('No se encontró registro de stock para este producto');
            }
        return stock.quantity;
        }

    async moveProductBetweenWarehouses(createMovementDto: CreateMovementDto): Promise < ResponseTransferDto > {
            const { products, warehouseId, destinationWarehouseId, quantity, createdBy, reason, companyId } = createMovementDto;
            const resultDto: ResultDto[] = [];
            let movementQuantity = quantity;
            let productName: string = '';

            for(const product of products) {
                const { productId, quantityByProduct } = product;

                try {
                    // Verificar si hay suficiente stock en la bodega de origen
                    const originStockData = await this.stockService.getStockDataByProductAndWarehouse(productId, warehouseId);
                    const stockQantity = originStockData.quantity;
                    if (stockQantity < quantityByProduct) {
                        throw new NotFoundException('No hay suficiente stock en la bodega de origen');
                    }

                    // 1. Restar la cantidad en la bodega de origen
                    const originStock = await this.stockModel.findOneAndUpdate(
                        { productId, warehouseId: warehouseId },
                        { $inc: { quantity: -Math.abs(quantityByProduct) } }, // Reducir stock en origen
                        { new: true }
                    ).populate('productId').exec();

                    if (!originStock) {
                        throw new Error(`Stock no encontrado para el producto en la bodega de origen ${warehouseId}`);
                    };

                    // 2. Sumar la cantidad en la bodega de destino
                    await this.stockModel.findOneAndUpdate(
                        { productId, warehouseId: destinationWarehouseId },
                        { $inc: { quantity: Math.abs(quantityByProduct) } }, // Aumentar stock en destino
                        { new: true, upsert: true }
                    );

                    // 3. Crear movimiento de salida de la bodega de origen
                    const exitMovement = new this.movementModel({
                        companyId,
                        warehouseId: warehouseId,
                        productId,
                        type: TypeMovementEnum.O,
                        quantity: movementQuantity,
                        reason,
                        createdBy,
                    });

                    // 4. Crear movimiento de entrada en la bodega de destino
                    const entryMovement = new this.movementModel({
                        companyId,
                        warehouseId: destinationWarehouseId,
                        productId,
                        type: TypeMovementEnum.E,
                        quantity: movementQuantity,
                        reason,
                        createdBy,
                    });

                    // 5. Crear movimiento de transferencia
                    const transferMovement = new this.movementModel({
                        companyId,
                        warehouseId: warehouseId,
                        destinationWarehouseId: destinationWarehouseId, // Registrar la bodega de destino
                        productId,
                        type: TypeMovementEnum.T,
                        quantity: movementQuantity,
                        reason,
                        createdBy
                    });

                    // Guardar movimientos
                    await exitMovement.save();
                    await entryMovement.save();
                    await transferMovement.save();

                    productName = (originStock?.productId as any).name;

                    resultDto.push({
                        product: productName ?? productId,
                        status: 'success',
                        message: 'Traslado exitoso'
                    });

                } catch (error) {
                    // Si ocurre un error, capturarlo y agregar al array de resultados
                    resultDto.push({
                        product: productName ?? productId,
                        status: 'error',
                        message: `Error al trasladar producto ${productId}: ${error.message}`
                    });
                }
            }

        // Devolver el array con los resultados de cada producto
        let responseTransferDto = new ResponseTransferDto();
            responseTransferDto.results = resultDto;
            responseTransferDto.message = 'Traslado finalizado';
            return responseTransferDto;
        }

    async createStockByWarehouse(CreateStockDto: CreateStockDto) {
            return this.stockService.create(CreateStockDto);
        }
    }
