import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTypeOfCustomerDto {
    @IsString({ message: 'El nombre del tipo de cliente debe ser un string.' })
    @IsNotEmpty({ message: 'El nombre del tipo de cliente no puede estar vacío.' })
    @ApiProperty({ description: "nombre del tipo de cliente" })
    readonly name: string;

}   