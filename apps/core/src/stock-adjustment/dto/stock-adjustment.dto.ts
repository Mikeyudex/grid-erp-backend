// create-stock-adjustment.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsArray } from 'class-validator';
import { TypeAdjustment } from '../stock-adjustment.schema';
import { Types } from 'mongoose';

export class CreateStockAdjustmentDto {

    @IsString({ message: 'El atributo companyId debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo companyId es un campo requerido.' })
    companyId: string;

    @IsString({ message: 'El atributo warehouseId debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo warehouseId es un campo requerido.' })
    warehouseId: string;

    @IsArray({ message: 'El atributo products debe ser un arreglo.' })
    @IsNotEmpty({ message: 'El atributo products es un campo requerido.' })
    products: Array<{
        productId: Types.ObjectId;
        oldQuantity: number;
        newQuantity: number;
        adjustedQuantity: number;
        costPrice: number;
    }>;

    @IsEnum(TypeAdjustment)
    @IsNotEmpty({ message: 'El atributo adjustmentType es un campo requerido.' })
    adjustmentType: TypeAdjustment;

    @IsNumber()
    @IsNotEmpty({ message: 'El atributo totalAdjustedPrice es un campo requerido.' })
    totalAdjustedPrice: number;

    @IsString({ message: 'El atributo note debe ser una cadena de texto.' })
    note: string;

    @IsString({ message: 'El atributo createdBy debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo createdBy es un campo requerido.' })
    createdBy: string;
}
