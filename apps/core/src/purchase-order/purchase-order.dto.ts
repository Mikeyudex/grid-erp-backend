import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { CreateIncomeDto } from '../accounting/dtos/income.dto';

class CreatePurchaseOrderItemDto {
  @IsString()
  @IsNotEmpty()
  matType: string;

  @IsString()
  @IsNotEmpty()
  materialType: string;

  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1)
  pieces: number;

  @IsArray()
  @IsString({ each: true })
  piecesNames: string[];

  @IsNumber()
  @IsPositive()
  priceItem: number;

  @IsNumber()
  @Min(1)
  quantityItem: number;

  @IsNumber()
  totalItem: number;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class CreatePurchaseOrderDto {
  @IsMongoId()
  clientId: string | Types.ObjectId;

  @IsNumber()
  itemsQuantity: number;

  @IsNumber()
  totalOrder: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  details: CreatePurchaseOrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsMongoId()
  zoneId?: string | Types.ObjectId;

  @IsOptional()
  @IsDate()
  deliveryDate?: Date;

  @IsMongoId()
  createdBy: string | Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  updatedBy?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIncomeDto)
  methodOfPayment: CreateIncomeDto[];
}
