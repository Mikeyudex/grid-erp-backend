// create-stock-adjustment.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { TypeAdjustment } from '../stock-adjustment.schema';

export class CreateStockAdjustmentDto {

    @IsString({ message: 'El atributo companyId debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo companyId es un campo requerido.' })
    companyId: string;

    @IsString({ message: 'El atributo warehouseId debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo warehouseId es un campo requerido.' })
    warehouseId: string;

    @IsString({ message: 'El atributo productId debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo productId es un campo requerido.' })
    productId: string;

    @IsEnum(TypeAdjustment)
    @IsNotEmpty({ message: 'El atributo adjustmentType es un campo requerido.' })
    adjustmentType: TypeAdjustment;

    @IsNumber({}, { message: 'El atributo quantity debe ser un número.' })
    @IsNotEmpty({ message: 'El atributo quantity es un campo requerido.' })
    quantity: number;

    @IsNumber()
    @IsNotEmpty({ message: 'El atributo totalAdjustedPrice es un campo requerido.' })
    totalAdjustedPrice: number;

    @IsString({ message: 'El atributo note debe ser una cadena de texto.' })
    note: string;

    @IsString({ message: 'El atributo createdBy debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo createdBy es un campo requerido.' })
    createdBy: string;
}
