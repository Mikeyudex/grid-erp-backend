import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    console.error('🔴 Excepción atrapada globalmente:', exception);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      response.status(status).json(
        typeof exceptionResponse === 'object' 
          ? exceptionResponse 
          : { statusCode: status, message: exceptionResponse }
      );
    } else {
      const message = exception instanceof Error ? exception.message : 'Error interno del servidor';
      
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ocurrió un error inesperado en el servidor',
        error: message,
      });
    }
  }
}