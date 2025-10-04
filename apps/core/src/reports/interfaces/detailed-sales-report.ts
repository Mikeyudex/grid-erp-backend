export interface DetailedSalesReportDto {
  fecha: Date | null;
  sede: string;
  asesor: string;
  cliente: string;
  nombreComercial: string;
  numeroFactura: string | number;
  tapetes: number;
  valorBase: number;
  descuento: number;
  subtotal: number;
  iva: number;
  retencion: number;
  valorTotal: number;
}