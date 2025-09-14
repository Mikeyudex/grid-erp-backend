import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateExpenseDto {
    @IsOptional()
    expenseId?: string | Types.ObjectId;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Número de secuencia' })
    sequence: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Fecha de pago' })
    paymentDate: Date;

    @IsOptional()
    @IsString()
    @IsMongoId()
    @ApiProperty({ description: 'Id del proveedor' })
    providerId: string | Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    @ApiProperty({ description: 'Id de la cuenta' })
    accountId: string | Types.ObjectId;

    @IsOptional()
    @IsArray()
    debtIds: string[] | Types.ObjectId[];

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @ApiProperty({ description: 'Valor del egreso' })
    value: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Observaciones' })
    observations: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Soporte de pago' })
    paymentSupport: string;

    @IsOptional()
    @ApiProperty({ description: 'Indica si el anticipo es vigente' })
    @IsBoolean()
    hasCurrentAdvancePayment?: boolean;

    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    @ApiProperty({ description: 'tipo de egreso' })
    typeOfExpenseId: string | Types.ObjectId;

}