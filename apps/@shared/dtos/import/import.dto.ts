import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class ExcelPayloadDto {
    @IsString()
    @IsNotEmpty()
    codigoexterno: string;

    @IsString()
    @IsNotEmpty()
    bodega: string;

    @IsString()
    @IsNotEmpty()
    categoria: string;

    @IsString()
    @IsNotEmpty()
    subcategoria: string;

    @IsString()
    @IsNotEmpty()
    proveedor: string;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsString()
    @IsNotEmpty()
    tipoproducto: string;

    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsString()
    @IsNotEmpty()
    unidadmedida: string;

    @IsNumber()
    @IsNotEmpty()
    precioventa: number;

    @IsNumber()
    @IsNotEmpty()
    preciocosto: number;

    @IsString()
    @IsOptional()
    color: string;

    @IsString()
    @IsOptional()
    talla: string;

    @IsString()
    @IsOptional()
    material: string;

    @IsString()
    @IsOptional()
    peso: string;

    @IsBoolean()
    @IsOptional()
    edicionlimitada: boolean | string;

    @IsString()
    @IsOptional()
    generacodigodebarra: string;

    @IsString()
    @IsOptional()
    imagenes: { text: string, hyperlink: string };
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

