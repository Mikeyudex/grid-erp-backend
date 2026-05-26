import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreatePrecioTapeteMaterialDto {
    @IsString({ message: 'El tipo de tapete es obligatorio' })
    @IsNotEmpty({ message: 'El tipo de tapete es obligatorio' })
    @ApiProperty({ example: 'ESTÁNDAR A' })
    tipo_tapete: string;

    @IsString({ message: 'El material es obligatorio' })
    @IsNotEmpty({ message: 'El material es obligatorio' })
    @ApiProperty({ example: 'ACERO' })
    tipo_material: string;

    @IsNumber()
    @IsNotEmpty({ message: 'El precio base es obligatorio' })
    @ApiProperty({ example: 2000 })
    precioBase: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 1500, required: false })
    precioMayorista?: number;
}

export class UpdatePrecioTapeteMaterialDto extends CreatePrecioTapeteMaterialDto { }