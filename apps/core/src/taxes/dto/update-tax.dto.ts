
import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTaxDto {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    name: string;

    @IsOptional()
    @IsNumber({}, { message: 'El porcentaje debe ser un número.' })
    percentage: number;

    @IsOptional()
    @IsString({ message: 'El campo description debe ser una cadena de texto.' })
    description?: string;

    @IsOptional()
    @IsBoolean({ message: 'El campo description debe ser de tipo booleano.' })
    active: boolean;
}