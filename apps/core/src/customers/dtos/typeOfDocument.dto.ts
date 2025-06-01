import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTypeOfDocumentDto {
    @IsString({ message: 'El nombre del tipo de documento debe ser un string.' })
    @IsNotEmpty({ message: 'El nombre del tipo de documento no puede estar vacío.' })
    @ApiProperty({ description: "nombre del tipo de documento" })
    readonly name: string;

}   