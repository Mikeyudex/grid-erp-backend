
import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateStockDto {
    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsString()
    warehouseLocation?: string;

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