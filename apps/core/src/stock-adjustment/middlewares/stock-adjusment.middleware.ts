import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateStockAdjustmentDto } from '../dto/stock-adjustment.dto';

@Injectable()
export class StockAdjustmentValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    
    const createStockAdjustmentDto = plainToInstance(CreateStockAdjustmentDto, req.body);
    const errors = await validate(createStockAdjustmentDto);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => ({
        field: error.property,
        message: Object.values(error.constraints).join(', '),
      }));

      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }
    next();
  }
}