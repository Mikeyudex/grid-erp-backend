import { IsNotEmpty, IsOptional, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateResourceDto {
    @IsString({ message: 'El nombre del recurso debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del recurso es requerido.' })
    @ApiProperty({ description: "nomber del recurso" })
    name: string;

    @IsString({ message: 'La descripción del recurso debe ser una cadena de texto.' })
    @IsOptional()
    @ApiProperty({ description: "descripción del recurso" })
    description: string;

    @IsString({ message: 'La ruta del recurso debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'La ruta del recurso es requerido.' })
    @ApiProperty({ description: "ruta del recurso" })
    path: string;

    @IsString({ message: 'El módulo del recurso debe ser una cadena de texto.' })
    @IsOptional()
    @ApiProperty({ description: "módulo al que pertenece el recurso (ej: reports, customers)" })
    module?: string;
}

export class UpdateResourceDto extends CreateResourceDto { }