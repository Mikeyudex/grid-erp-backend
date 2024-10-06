// create-movement.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsEnum, Min, IsOptional, IsArray, IsMongoId, ValidateNested } from 'class-validator';
import { TypeMovementEnum } from '../movement.schema';
import { Type } from 'class-transformer';


export class TransferProductDto {
  @IsNotEmpty({ message: 'El atributo productId es un campo requerido.' })
  @IsMongoId({ message: 'El atributo productId tiene que ser un id valido.' })
  productId: string;

  @IsNotEmpty({ message: 'El atributo quantityByProduct es un campo requerido.' })
  @IsNumber({}, { message: 'El atributo quantityByProduct debe ser un número.' })
  @Min(1)
  quantityByProduct: number;
}

export class CreateMovementDto {
  @IsString({ message: 'El atributo companyId debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El atributo companyId es un campo requerido.' })
  companyId: string;

  @IsString({ message: 'El atributo productId debe ser un string.' })
  @IsNotEmpty({ message: 'El atributo productId es un campo requerido.' })
  productId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferProductDto)
  products?: TransferProductDto[];

  @IsString({ message: 'El atributo warehouseId debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El atributo warehouseId es un campo requerido.' })
  warehouseId: string;

  @IsString({ message: 'El atributo warehouseId debe ser una cadena de texto.' })
  @IsOptional()
  destinationWarehouseId?: string;

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

export class ResponseMovementDto {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  productId: string;
  productName: string;
  type: string;
  quantity: number;
  reason: string;
  createdById: string;
  createdByName: string;
  createdByLastName: string;
  createdAt: Date;
}


export class ResultDto {
  product: string;
  status: string;
  message: string;
}
export class ResponseTransferDto {
  message: string;
  results: ResultDto[];
}
