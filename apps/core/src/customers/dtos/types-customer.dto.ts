import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTypesCustomerDto {
    @IsString({ message: 'El nombre del tipo de cliente debe ser un string.' })
    @IsNotEmpty({ message: 'El nombre del tipo de cliente no puede estar vacío.' })
    @ApiProperty({ description: "nomber del tipo de cliente" })
    readonly name: string;

    @IsString({ message: 'La propiedad description debe ser un string.' })
    @IsNotEmpty({ message: 'La propiedad description no puede estar vacío.' })
    @ApiProperty({ description: "descripción del tipo de cliente" })
    readonly description: string;

    @IsString({ message: 'La propiedad shortCode debe ser un string.' })
    @IsNotEmpty({ message: 'La propiedad shortCode no puede estar vacío.' })
    @ApiProperty({ description: "código corto del tipo de cliente" })
    readonly shortCode: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ description: "estado del tipo de cliente" })
    readonly active: boolean;

    @IsNumber()
    @ApiProperty({ description: "porcentaje de descuento del tipo de cliente" })
    readonly percentDiscount: number;
}

export class UpdateTypesCustomerDto {
    @IsString({ message: 'El nombre del tipo de cliente debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "nomber del tipo de cliente" })
    readonly name: string;

    @IsString({ message: 'La propiedad description debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "descripción del tipo de cliente" })
    readonly description: string;

    @IsString({ message: 'La propiedad shortCode debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "código corto del tipo de cliente" })
    readonly shortCode: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ description: "estado del tipo de cliente" })
    readonly active: boolean;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ description: "porcentaje de descuento del tipo de cliente" })
    readonly percentDiscount: number;
}   