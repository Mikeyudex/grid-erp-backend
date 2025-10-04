export interface ProductSalesReportDto {
  sede: string;
  asesor: string;
  cliente: string;
  producto: string;
  tipoTapete: string;
  material: string;
  cantidad: number;
  valorBase: number;
  descuento: number;
  subtotal: number;
  iva: number;
  retencion: number;
  valorTotal: number;
}