import { IsArray, IsNotEmpty, IsOptional, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateRoleUserDto {
    @IsString( { message: 'El nombre del rol debe ser una cadena de texto.' })
    @IsNotEmpty( { message: 'El nombre del rol es requerido.' })
    @ApiProperty({ description: "nomber del rol" })
    name: string;

    @IsString( { message: 'La descripción del rol debe ser una cadena de texto.' })
    @IsOptional()
    @ApiProperty({ description: "descripción del rol" })
    description: string;

    @IsArray( { message: 'Los recursos del rol deben ser una lista de cadenas de texto.' })
    @IsOptional()
    @ApiProperty({ description: "recursos del rol" })
    resources: string[];
}

export class UpdateRoleUserDto extends CreateRoleUserDto { }

export class AddResourceDto {
    @IsString( { message: 'El recurso debe ser una cadena de texto.' })
    @IsNotEmpty( { message: 'El recurso es requerido.' })
    @ApiProperty({ description: "recurso" })
    resource: string[];
}