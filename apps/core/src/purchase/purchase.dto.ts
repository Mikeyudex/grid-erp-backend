import {
    IsArray,
    IsDate,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { CreateIncomeDto } from '../accounting/dtos/income.dto';

export class CreatePurchaseDetailDto {

    @IsMongoId()
    productId: string | Types.ObjectId;

    @IsMongoId()
    taxId: string | Types.ObjectId;

    @IsMongoId()
    retentionId: string | Types.ObjectId;

    @IsNumber()
    @Min(1)
    itemPrice: number;

    @IsNumber()
    @Min(1)
    itemQuantity: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    itemTotal: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discountPercentage: number;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsMongoId()
    createdBy: string | Types.ObjectId;
}

export class CreatePurchaseDto {
    @IsMongoId()
    providerId: string | Types.ObjectId;

    @Min(1)
    @IsNumber()
    itemsQuantity: number;

    @IsNumber()
    totalOrder: number;

    @IsOptional()
    @IsString({ message: 'El campo supplierInvoiceNumber debe ser una cadena de texto.' })
    supplierInvoiceNumber: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseDetailDto)
    detail: CreatePurchaseDetailDto[];

    @IsOptional()
    @IsString({ message: 'El campo observations debe ser una cadena de texto.' })
    observations?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateIncomeDto)
    methodOfPayment: CreateIncomeDto[];

    @IsOptional()
    @IsMongoId()
    createdBy: string | Types.ObjectId;

    @IsOptional()
    @IsMongoId()
    zoneId: string | Types.ObjectId;

    @IsOptional()
    @IsMongoId()
    updatedBy: string | Types.ObjectId;

    @IsOptional()
    @IsDate()
    createdAt: Date;

    @IsOptional()
    @IsDate()
    updatedAt: Date;
}

export class UpdatePurchaseDto {

    @IsOptional()
    @IsMongoId()
    providerId: string | Types.ObjectId;

    @IsOptional()
    @Min(1)
    @IsNumber()
    itemsQuantity: number;

    @IsOptional()
    @IsNumber()
    totalOrder: number;

    @IsOptional()
    @IsString({ message: 'El campo supplierInvoiceNumber debe ser una cadena de texto.' })
    supplierInvoiceNumber: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseDetailDto)
    detail: CreatePurchaseDetailDto[];

    @IsOptional()
    @IsString({ message: 'El campo observations debe ser una cadena de texto.' })
    observations?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateIncomeDto)
    methodOfPayment: CreateIncomeDto[];

    @IsOptional()
    @IsMongoId()
    createdBy: string | Types.ObjectId;

    @IsOptional()
    @IsMongoId()
    updatedBy: string | Types.ObjectId;

    @IsOptional()
    @IsDate()
    createdAt: Date;

    @IsOptional()
    @IsDate()
    updatedAt: Date;
}   