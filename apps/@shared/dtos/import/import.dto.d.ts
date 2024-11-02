export declare class ExcelPayloadDto {
    codigoexterno: string;
    bodega: string;
    categoria: string;
    subcategoria: string;
    proveedor: string;
    nombre: string;
    descripcion: string;
    tipoproducto: string;
    sku: string;
    unidadmedida: string;
    precioventa: number;
    preciocosto: number;
    color: string;
    talla: string;
    material: string;
    peso: string;
    edicionlimitada: boolean | string;
    generacodigodebarra: string;
    imagenes: {
        text: string;
        hyperlink: string;
    };
}
