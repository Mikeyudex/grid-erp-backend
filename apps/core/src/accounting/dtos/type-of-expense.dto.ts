import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTypeOfExpenseDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Nombre' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Código' })
    code: string;
}

export class UpdateTypeOfExpenseDto {

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Nombre' })
    name?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Código' })
    code?: string;
}