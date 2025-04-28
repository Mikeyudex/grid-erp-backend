import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateZoneDto {
    @IsNotEmpty()
    @IsString({ message: 'El atributo name debe ser una cadena de texto.' })
    @ApiProperty({ description: "Nombre del zona", example: "Zona 1" })
    name:string;

    @IsOptional()
    @IsString({ message: 'El atributo shortCode debe ser una cadena de texto.' })
    @ApiProperty({ description: "Codigo corto del zona", example: "Z1" })
    shortCode:string;
}