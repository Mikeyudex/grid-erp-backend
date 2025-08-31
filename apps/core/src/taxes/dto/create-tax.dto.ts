import { IsString, IsNumber, IsOptional, IsBoolean, IsNotEmpty, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTaxDto {

  @IsOptional()
  @IsMongoId()
  companyId: string | Types.ObjectId;

  @IsNotEmpty({ message: 'El nombre es un campo requerido.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  name: string;

  @IsNumber({}, { message: 'El porcentaje debe ser un número.' })
  percentage: number;

  @IsOptional()
  @IsString({ message: 'El campo description debe ser una cadena de texto.' })
  description?: string;

  @IsNotEmpty({ message: 'El shortCode es un campo requerido.' })
  @IsString({ message: 'El shortCode debe ser una cadena de texto.' })
  shortCode?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo description debe ser de tipo booleano.' })
  active: boolean;
}
