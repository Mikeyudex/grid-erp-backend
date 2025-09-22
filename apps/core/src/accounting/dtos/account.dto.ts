import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAccountDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Nombre'})
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Tipo de cuenta'})
    typeAccount: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Banco'})
    bankAccount: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Número de cuenta'})
    numberAccount: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Activo'})
    isActive: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({description: 'Descripción'})
    description: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({description: 'Balance'})
    balance: number;
}

export class UpdateAccountDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Nombre'})
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Tipo de cuenta'})
    typeAccount: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Banco'})
    bankAccount: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Número de cuenta'})
    numberAccount: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Activo'})
    isActive: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({description: 'Descripción'})
    description: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({description: 'Balance'})
    balance: number;
}