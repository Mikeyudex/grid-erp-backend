// create-movement.dto.ts
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTypesProductDto {
    @IsString({ message: 'El atributo name debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo name es un campo requerido.' })
    name: string;

    @IsString({ message: 'El atributo description debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo description es un campo requerido.' })
    description: string;

    @ApiProperty({ example: true, description: 'tipo de producto active o no.' })
    @IsNotEmpty({ message: 'El atributo active es un campo requerido.' })
    @IsBoolean({ message: 'El atributo active debe ser un booleano.' })
    active: boolean;
}
