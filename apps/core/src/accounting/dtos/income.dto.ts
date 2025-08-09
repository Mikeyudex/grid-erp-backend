import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateIncomeDto {

    @IsString()
    @IsOptional()
    @ApiProperty({description: 'Id del pedido'})
    purchaseOrderId: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({description: 'Secuencia'})
    sequence: number;

    @IsString() 
    @IsNotEmpty()
    @ApiProperty({description: 'Tipo de operación'})
    typeOperation: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Fecha de pago'})
    paymentDate: Date;

    @IsString()
    @IsOptional()
    @ApiProperty({description: 'Id del cliente'})
    customerId: string;

    @IsString()
    @IsOptional()
    @ApiProperty({description: 'Id del proveedor'})
    providerId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Id de la cuenta'})
    accountId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({description: 'Valor'})
    value: number;

    @IsString()
    @IsOptional()
    @ApiProperty({description: 'Observaciones'})
    observations: string;

    @IsString()
    @IsOptional()
    @ApiProperty({description: 'Soporte de pago'})
    paymentSupport: string;
}