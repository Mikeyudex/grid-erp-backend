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
    imagenes: {text:string, hyperlink:string};
}