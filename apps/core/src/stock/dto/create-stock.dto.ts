import { IsNotEmpty, IsNumber, IsString, IsMongoId, IsOptional, IsBoolean } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateStockDto {
    @IsNotEmpty()
    @IsMongoId()
    productId: string | ObjectId;
  
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
  
    @IsNotEmpty()
    @IsString()
    warehouseId: string;
  
    @IsOptional()
    @IsNumber()
    minQuantity?: number;
  
    @IsOptional()
    @IsNumber()
    maxQuantity?: number;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  }
  