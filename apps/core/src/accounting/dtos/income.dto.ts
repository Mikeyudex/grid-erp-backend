import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateIncomeDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Id del pedido'})
    purchaseOrderId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({description: 'Número de secuencia'})
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
    @IsNotEmpty()
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
    @IsNotEmpty()
    @ApiProperty({description: 'Observaciones'})
    observations: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({description: 'Soporte de pago'})
    paymentSupport: string;

}