import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateWoocommerceDto {
    @IsString({ message: 'El atributo companyId debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El atributo companyId es un campo requerido.' })
    companyId: string;
  
    @IsString({ message: 'El atributo wooCommerceUrl debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo wooCommerceUrl es un campo requerido.' })
    wooCommerceUrl: string;
  
    @IsString({ message: 'El atributo wooCommerceConsumerKey debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo wooCommerceConsumerKey es un campo requerido.' })
    wooCommerceConsumerKey: string;

    @IsString({ message: 'El atributo wooCommerceConsumerSecret debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo wooCommerceConsumerSecret es un campo requerido.' })
    wooCommerceConsumerSecret: string;

    @IsOptional()
    @IsBoolean({ message: 'El atributo isActive debe ser de tipo booleano.' })
    isActive: boolean;
  }


  export class UpdateWoocommerceDto {

    @IsString({ message: 'El atributo wooCommerceUrl debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo wooCommerceUrl es un campo requerido.' })
    wooCommerceUrl: string;
  
    @IsString({ message: 'El atributo wooCommerceConsumerKey debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo wooCommerceConsumerKey es un campo requerido.' })
    wooCommerceConsumerKey: string;

    @IsString({ message: 'El atributo wooCommerceConsumerSecret debe ser un string.' })
    @IsNotEmpty({ message: 'El atributo wooCommerceConsumerSecret es un campo requerido.' })
    wooCommerceConsumerSecret: string;

    @IsOptional()
    @IsBoolean({ message: 'El atributo isActive debe ser de tipo booleano.' })
    isActive: boolean;
  }