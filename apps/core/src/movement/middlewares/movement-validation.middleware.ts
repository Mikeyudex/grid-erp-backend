import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMovementDto } from '../dto/movement.dto';

@Injectable()
export class MovementValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {

    let createMovementDto = plainToInstance(CreateMovementDto, req.body);

    const errors = await validate(createMovementDto);

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
