// create-movement.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsEnum, Min } from 'class-validator';
import {  TypeMovementEnum } from '../movement.schema';

export class CreateMovementDto {
  @IsString({ message: 'El atributo productId debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El atributo productId es un campo requerido.' })
  productId: string;

  @IsString({ message: 'El atributo warehouseId debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El atributo warehouseId es un campo requerido.' })
  warehouseId: string;

  @IsEnum(TypeMovementEnum)
  type: string;

  @IsNumber({}, { message: 'El atributo quantity debe ser un número.' })
  @IsNotEmpty({ message: 'El atributo quantity es requerido.' })
  @Min(1, { message: 'El atributo quantity no puede ser menor que 1.' })
  quantity: number;

  @IsString({ message: 'El atributo reason debe ser una cadena de texto.' })
  reason?: string;

  @IsString({ message: 'El atributo createdBy debe ser una cadena de texto.' })
  createdBy?: string; //Id del usuario que realiza la operación
}
