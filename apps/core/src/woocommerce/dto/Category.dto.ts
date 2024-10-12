import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class WooCommerceCategoryImageDto {
    @ApiProperty({ example: 'http://demo.woothemes.com/woocommerce/wp-content/uploads/sites/56/2013/06/T_2_front.jpg' })
    @IsString({ message: 'El atributo src debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo src es un campo requerido.' })
    src: string;

    @ApiProperty({ example: 2 })
    @IsNumber({}, { message: 'El atributo id debe ser un numero.' })
    @IsOptional()
    id?: string;

    @ApiProperty({ example: 'image-2.jpg' })
    @IsString({ message: 'El atributo name debe ser una cadena de texto.' })
    @IsOptional()
    name?: string;
}


export class CreateWooCommerceCategoryDto {

    @ApiProperty({ example: 'CARDANES' })
    @IsString({ message: 'El atributo name debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo name es un campo requerido.' })
    name: string;

    @ApiProperty({ example: 'cardanes' })
    @IsString({ message: 'El atributo slug debe ser una cadena de texto.' })
    @IsOptional()
    slug: string;

    @ApiProperty({ example: 17 })
    @IsNumber({}, { message: 'El atributo parent debe ser un numero.' })
    @IsOptional()
    parent: number;

    @ApiProperty({ example: '' })
    @IsString({ message: 'El atributo description debe ser una cadena de texto.' })
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'default' })
    @IsString({ message: 'El atributo display debe ser una cadena de texto.' })
    @IsOptional()
    display: string;

    @ApiProperty({ example: null, nullable: true })
    @IsString({ message: 'El atributo image debe ser de tipo object.' })
    @IsOptional()
    image?: WooCommerceCategoryImageDto;
}
