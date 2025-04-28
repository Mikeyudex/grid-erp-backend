import { IsString, IsNotEmpty, IsEmail, Length, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { RolesEnum } from '../enums/roles.enum';
import { Types } from 'mongoose';

export class CreateUserDto {
    @IsString({ message: 'El email debe ser una cadena de texto.' })
    @IsEmail()
    @ApiProperty({ description: "the user' email" })
    readonly email: string;

    @IsString({ message: 'El telefono debe ser una cadena de texto.' })
    @IsEmail()
    @ApiProperty({ description: "the user' phone" })
    readonly phone: string;


    @IsString({ message: 'El atributo name debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo name es requerido.' })
    @ApiProperty({ description: "the user name" })
    readonly name: string;

    @IsString({ message: 'El atributo lastname debe ser una cadena de texto.' })
    @IsOptional()
    @ApiProperty({ description: "the user lastname" })
    readonly lastname: string;

    @IsString({ message: 'El password debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El password debe es requerido.' })
    @Length(6)
    @ApiProperty({ description: "the user' password", deprecated: true })
    readonly password: string;

    @IsOptional()
    @IsEnum(RolesEnum, { message: 'El rol debe ser un valor válido.' })
    readonly role: string;

    @IsOptional()
    @IsMongoId({ message: 'El atributo zoneId debe ser un identificador de MongoDB.' })
    @IsString({ message: 'El atributo zoneId debe ser una cadena de texto.' })
    @ApiProperty({ description: 'Identificador de zona del usuario' })
    zoneId: string | Types.ObjectId;
    
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }