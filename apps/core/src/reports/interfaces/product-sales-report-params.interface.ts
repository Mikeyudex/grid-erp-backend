export interface ProductSalesReportParams {
  zoneId?: string;
  advisorId?: string;
  clientId?: string;
  productId?: string;
  matType?: string;
  materialType?: string;
  startDate?: string;
  endDate?: string;
  global?: boolean; // true = acumulado, false = detallado
}
