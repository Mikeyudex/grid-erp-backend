
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";


export class CreateDebtDto {

    @IsString()
    @IsNotEmpty()
    customerId: string | Types.ObjectId;

    @IsOptional()
    @IsString()
    providerId: string | Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    purchaseOrderId: string | Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    amountPayable: number;

    @IsString()
    @IsNotEmpty()
    status: 'abierto' | 'cerrado';

    @IsOptional()
    @IsBoolean()
    isInternalDebt?: boolean;

    @IsOptional()
    @IsString()
    dueDate: string;
}

export class UpdateDebtDto {

    @IsOptional()
    @IsString()
    customerId: string | Types.ObjectId;

    @IsOptional()
    @IsString()
    providerId: string | Types.ObjectId;

    @IsOptional()
    @IsString()
    purchaseOrderId: string | Types.ObjectId;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsNumber()
    amountPayable: number;

    @IsOptional()
    status: 'abierto' | 'cerrado';

    @IsOptional()
    @IsBoolean()
    isInternalDebt?: boolean;

    @IsOptional()
    @IsString()
    dueDate: string;
}

export class GetDebtsDto {

    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsOptional()
    @IsString()
    providerId: string;

    @IsString()
    @IsNotEmpty()
    purchaseOrderId: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    amountPayable: number;

    @IsString()
    @IsNotEmpty()
    status: 'abierto' | 'cerrado';

    @IsOptional()
    @IsBoolean()
    isInternalDebt?: boolean;

    @IsString()
    @IsNotEmpty()
    dueDate: string;
}

export class GetDebtsResponseDto {
    debts: GetDebtsDto[];
}