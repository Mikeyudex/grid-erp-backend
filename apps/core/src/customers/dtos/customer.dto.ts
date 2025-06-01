import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateCustomerDto {
    @IsMongoId()
    typeCustomerId: string;

    @IsMongoId()
    typeOfCustomer: string;

    @IsMongoId()
    typeOfDocument: string;

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

    @IsString({ message: 'El documento del cliente debe ser un string.' })
    @IsNotEmpty({ message: 'El documento del cliente no puede estar vacío.' })
    @ApiProperty({ description: "documento del cliente" })
    documento: string;

    @IsString({ message: 'La propiedad city debe ser un string.' })
    @IsNotEmpty({ message: 'La propiedad city no puede estar vacío.' })
    @ApiProperty({ description: "ciudad del cliente" })
    city: string;

    @IsString({ message: 'La propiedad address debe ser un string.' })
    @IsNotEmpty({ message: 'La propiedad address no puede estar vacío.' })
    @ApiProperty({ description: "dirección del cliente" })
    address: string;

    @IsString({ message: 'La propiedad shippingName debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "nombre del cliente de entrega" })
    shippingName: string;

    @IsString({ message: 'La propiedad shippingLastname debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "apellido del cliente de entrega" })
    shippingLastname: string;

    @IsString({ message: 'La propiedad shippingPhone debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "telefono del cliente de entrega" })
    shippingPhone: string;

    @IsEmail()
    @IsOptional()
    @ApiProperty({ description: "correo electrónico del cliente de entrega" })
    shippingEmail: string;

    @IsString({ message: 'La propiedad shippingDocumento debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "documento del cliente de entrega" })
    shippingDocumento: string;

    @IsString({ message: 'La propiedad shippingAddress debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "dirección del cliente de entrega" })
    shippingAddress: string;

    @IsString({ message: 'La propiedad shippingCity debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "ciudad del cliente de entrega" })
    shippingCity: string;

    @IsString({ message: 'La propiedad shippingPostalCode debe ser un string.' })
    @IsOptional()
    @ApiProperty({ description: "código postal del cliente de entrega" })
    shippingPostalCode: string;

    @IsArray({ message: 'La propiedad contacts debe ser un array.' })
    @IsOptional()
    @ApiProperty({ description: "contactos del cliente de entrega" })
    contacts: IContactsCustomer[];

    @IsArray({ message: 'La propiedad customFields debe ser un array.' })
    @IsOptional()
    @ApiProperty({ description: "campos personalizados del cliente de entrega" })
    customFields: ICustomField[];

    @IsString({ message: 'La propiedad observations debe ser un string.' })
    @IsOptional()
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