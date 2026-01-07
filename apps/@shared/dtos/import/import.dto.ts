import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class ExcelPayloadDto {
    @IsString()
    @IsNotEmpty()
    marca: string;

    @IsString()
    @IsNotEmpty()
    linea: string;

    @IsString()
    @IsNotEmpty()
    piezas: string;

    @IsNumber()
    @IsNotEmpty()
    precio_base: number;

    @IsString()
    @IsNotEmpty()
    observaciones: string;

    @IsString()
    @IsNotEmpty()
    tipo_vehiculo: string;

    @IsString()
    @IsOptional()
    tomado_por: string;

    @IsString()
    @IsOptional()
    moldes_fisicos: string;
}

export class ExcelPayloadDtoTapete {
    @IsString()
    @IsNotEmpty()
    tipo: string;

    @IsString()
    @IsNotEmpty()
    marca: string;

    @IsString()
    @IsNotEmpty()
    linea: string;

    @IsString()
    @IsNotEmpty()
    piezas: string;

    @IsString()
    @IsOptional()
    tipo_tapete: string;

    @IsString()
    @IsOptional()
    material: string;

    @IsString()
    @IsOptional()
    cantidad: string;

    @IsString()
    @IsOptional()
    descripcion: string;

    @IsString()
    @IsOptional()
    cod_externo: string;

    @IsString()
    @IsNotEmpty()
    precio_mayorista: string;

    @IsString()
    @IsNotEmpty()
    precio_base: string;

    @IsString()
    @IsOptional()
    valor_total: string;

    @IsString()
    @IsOptional()
    observaciones_cliente: string;

    @IsString()
    @IsOptional()
    pieza_1: string;

    @IsString()
    @IsOptional()
    pieza_2: string;

    @IsString()
    @IsOptional()
    pieza_3: string;

    @IsString()
    @IsOptional()
    pieza_4: string;

    @IsString()
    @IsOptional()
    pieza_5: string;
}

