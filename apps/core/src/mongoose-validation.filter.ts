import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Error as MongooseError } from 'mongoose';

@Catch(MongooseError.ValidationError)
export class MongooseValidationFilter implements ExceptionFilter {
  catch(exception: MongooseError.ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errors = Object.values(exception.errors).map((err: any) => err.message);

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Error de validación de datos.',
      errors,
    });
  }
}
