
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Types } from "mongoose";


export class CreateDebtDto {

    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsNotEmpty()
    purchaseOrderId: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    amountPayable: number;
}

export class UpdateDebtDto {

    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsNotEmpty()
    purchaseOrderId: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    amountPayable: number;
}

export class GetDebtsDto {

    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsNotEmpty()
    purchaseOrderId: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    amountPayable: number;
}

export class GetDebtsResponseDto {
    debts: GetDebtsDto[];
}