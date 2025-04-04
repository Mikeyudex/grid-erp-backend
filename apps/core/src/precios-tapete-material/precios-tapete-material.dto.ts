import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


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
}

export class UpdatePrecioTapeteMaterialDto extends CreatePrecioTapeteMaterialDto { }