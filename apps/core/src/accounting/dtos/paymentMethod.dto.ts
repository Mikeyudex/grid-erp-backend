import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreatePaymentMethodDto {
    @IsString({ message: 'La propiedad description debe ser un string.' })
    @IsNotEmpty({ message: 'La propiedad description no puede estar vacío.' })
    @ApiProperty({ description: "Descripción del método de pago." })
    description: string;

    @IsNumber()
    @IsNotEmpty({ message: 'La propiedad code no puede estar vacío.' })
    @ApiProperty({ description: "Código del método de pago." })
    code: number;
}

export class UpdatePaymentMethodDto extends CreatePaymentMethodDto {
}