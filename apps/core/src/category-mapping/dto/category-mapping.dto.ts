import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";


export class CreateCategoryMappingDto {
    @IsString({ message: 'El atributo companyId debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo companyId es un campo requerido.' })
    companyId: string;

    @IsString({ message: 'El atributo internalCategoryId debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo internalCategoryId es un campo requerido.' })
    internalCategoryId: string;

    @IsString({ message: 'El atributo woocommerceCategoryId debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo woocommerceCategoryId es un campo requerido.' })
    woocommerceCategoryId: string;

    @IsString({ message: 'El atributo meliCategoryId debe ser un string.' })
    @IsOptional()
    meliCategoryId: string;

    @IsString({ message: 'El atributo createdBy debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo createdBy es un campo requerido.' })
    createdBy: string;
}


export class CreateCategoryMappingsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCategoryMappingDto)
    mappings: CreateCategoryMappingDto[];
  }

export class UpdateCategoryMappingDto {
    @IsString({ message: 'El atributo internalCategoryId debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo internalCategoryId es un campo requerido.' })
    internalCategoryId: string;

    @IsString({ message: 'El atributo woocommerceCategoryId debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo woocommerceCategoryId es un campo requerido.' })
    woocommerceCategoryId: string;

    @IsString({ message: 'El atributo meliCategoryId debe ser un string.' })
    @IsOptional()
    meliCategoryId: string;

    @IsString({ message: 'El atributo createdBy debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo createdBy es un campo requerido.' })
    createdBy: string;
}