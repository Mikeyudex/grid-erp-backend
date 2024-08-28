import { IsString, IsNumber, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateTaxDto {

  @IsOptional()
  @IsString({ message: 'El id de la empresa debe ser una cadena de texto.' })
  companyId: string;

  @IsNotEmpty({ message: 'El nombre es un campo requerido.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  name: string;

  @IsNumber({}, { message: 'El porcentaje debe ser un número.' })
  percentage: number;

  @IsOptional()
  @IsString({ message: 'El campo description debe ser una cadena de texto.' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo description debe ser de tipo booleano.' })
  active: boolean;
}
