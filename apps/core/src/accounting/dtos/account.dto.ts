import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

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
}