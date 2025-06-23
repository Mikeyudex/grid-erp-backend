import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('🔴 Excepción atrapada globalmente:', exception);
  }
}