import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateRelatedToDto {
    @IsString({ message: 'La propiedad name debe ser un string.' })
    @IsNotEmpty({ message: 'La propiedad name no puede estar vacío.' })
    @ApiProperty({ description: "Nombre de la relación." })
    name: string;

    @IsNumber()
    @IsNotEmpty({ message: 'La propiedad code no puede estar vacío.' })
    @ApiProperty({ description: "Código de la relación." })
    code: number;
}

export class UpdateRelatedToDto extends CreateRelatedToDto {
}