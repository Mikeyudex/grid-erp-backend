export interface CumulativeSalesReportDto {
  sede: string;
  asesor: string;
  pedidos: number;
  tapetes: number;
  valorBase: number;
  descuento: number;
  subtotal: number;
  iva: number;
  retencion: number;
  valorTotal: number;
}