import { IsNotEmpty, IsNumber, IsString, IsMongoId, IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateStockDto {
    @IsNotEmpty()
    @IsMongoId()
    productId: string | Types.ObjectId;
  
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
  
    @IsNotEmpty()
    @IsMongoId()
    warehouseId: string | Types.ObjectId;
  
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
  