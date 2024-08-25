import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class ProductValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    
    
    const productCreateDto = plainToInstance(CreateProductDto, req.body);
    const errors = await validate(productCreateDto);

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
