import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateIncomeDto {

    @IsOptional()
    incomeId?: string | Types.ObjectId;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Id del pedido' })
    purchaseOrderId: string | Types.ObjectId;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ description: 'Secuencia' })
    sequence: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Tipo de operación' })
    typeOperation: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Fecha de pago' })
    paymentDate: Date;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Id del cliente' })
    customerId: string | Types.ObjectId;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Id del proveedor' })
    providerId: string | Types.ObjectId;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Id de la cuenta' })
    accountId: string | Types.ObjectId;

    @IsArray()
    @IsOptional()
    @ApiProperty({ description: 'Ids de las deudas' })
    debtIds: string[] | Types.ObjectId[];

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Valor' })
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
    hasCurrentAdvancePayment?: boolean;
}