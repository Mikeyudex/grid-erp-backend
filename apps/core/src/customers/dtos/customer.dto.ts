import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";


export class CreateCustomerDto {
    @IsMongoId()
    typeCustomerId: string | Types.ObjectId;

    @IsMongoId()
    typeOfCustomer: string | Types.ObjectId;

    @IsMongoId()
    typeOfDocument: string | Types.ObjectId;

    @IsString({ message: 'El nombre del cliente debe ser un string.' })
    @IsNotEmpty({ message: 'El nombre del cliente no puede estar vacío.' })
    @ApiProperty({ description: "nomber del cliente" })
    name: string;

    @IsString({ message: 'El apellido del cliente debe ser un string.' })
    @IsNotEmpty({ message: 'El apellido del cliente no puede estar vacío.' })
    @ApiProperty({ description: "apellido del cliente" })
    lastname: string;

    @IsEmail()
    @IsNotEmpty({ message: 'El correo electrónico del cliente no puede estar vacío.' })
    @ApiProperty({ description: "correo electrónico del cliente" })
    email: string;

    @IsNotEmpty({ message: 'El documento del cliente no puede estar vacío.' })
    @IsString({ message: 'El documento del cliente debe ser un string.' })
    @ApiProperty({ description: "documento del cliente" })
    documento: string;

    @IsNotEmpty({ message: 'La propiedad city no puede estar vacío.' })
    @IsString({ message: 'La propiedad city debe ser un string.' })
    @ApiProperty({ description: "ciudad del cliente" })
    city: string;

    @IsNotEmpty({ message: 'La propiedad address no puede estar vacío.' })
    @IsString({ message: 'La propiedad address debe ser un string.' })
    @ApiProperty({ description: "dirección del cliente" })
    address: string;

    @IsOptional()
    @IsString({ message: 'La propiedad postalCode debe ser un string.' })
    @ApiProperty({ description: "código postal del cliente" })
    postalCode: string;

    @IsOptional()
    @IsString({ message: 'La propiedad shippingName debe ser un string.' })
    @ApiProperty({ description: "nombre del cliente de entrega" })
    shippingName: string;

    @IsOptional()
    @IsString({ message: 'La propiedad shippingLastname debe ser un string.' })
    @ApiProperty({ description: "apellido del cliente de entrega" })
    shippingLastname: string;

    @IsOptional()
    @IsString({ message: 'La propiedad shippingPhone debe ser un string.' })
    @ApiProperty({ description: "telefono del cliente de entrega" })
    shippingPhone: string;

    @IsOptional()
    @IsEmail()
    @ApiProperty({ description: "correo electrónico del cliente de entrega" })
    shippingEmail: string;

    @IsOptional()
    @IsString({ message: 'La propiedad shippingDocumento debe ser un string.' })
    @ApiProperty({ description: "documento del cliente de entrega" })
    shippingDocumento: string;

    @IsOptional()
    @IsString({ message: 'La propiedad shippingAddress debe ser un string.' })
    @ApiProperty({ description: "dirección del cliente de entrega" })
    shippingAddress: string;

    @IsOptional()
    @IsString({ message: 'La propiedad shippingCity debe ser un string.' })
    @ApiProperty({ description: "ciudad del cliente de entrega" })
    shippingCity: string;

    @IsOptional()
    @IsString({ message: 'La propiedad shippingPostalCode debe ser un string.' })
    @ApiProperty({ description: "código postal del cliente de entrega" })
    shippingPostalCode: string;

    @IsOptional()
    @IsArray({ message: 'La propiedad contacts debe ser un array.' })
    @ApiProperty({ description: "contactos del cliente de entrega" })
    contacts: IContactsCustomer[];

    @IsOptional()
    @IsArray({ message: 'La propiedad customFields debe ser un array.' })
    @ApiProperty({ description: "campos personalizados del cliente de entrega" })
    customFields: ICustomField[];
    
    @IsOptional()
    @IsString({ message: 'La propiedad observations debe ser un string.' })
    @ApiProperty({ description: "observaciones del cliente de entrega" })
    observations: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {
}

export interface IContactsCustomer {
    contactName: string;
    contactLastname: string;
    contactPhone: string;
    contactEmail: string;
    contactCharge: string;
}

export interface ICustomField {
    key: string;
    value: string;
}