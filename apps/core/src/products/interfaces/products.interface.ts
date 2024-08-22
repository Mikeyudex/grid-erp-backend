export interface Product {
    name: string;   // Nombre del producto (e.g., 'Camiseta')
    sku: string;    // SKU del producto
    salePrice: number;  // Precio de venta del producto
    costPrice: number;  // Precio de costo del producto
    attributes: Record<string, any>;  // Atributos personalizados (e.g., { color: 'rojo', size: 'L' })
  }
  