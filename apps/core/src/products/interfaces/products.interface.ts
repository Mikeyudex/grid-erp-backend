export interface Product {
    name: string;   // Nombre del producto (e.g., 'Camiseta')
    sku: string;    // SKU del producto
    price: number;  // Precio del producto
    attributes: Record<string, any>;  // Atributos personalizados (e.g., { color: 'rojo', size: 'L' })
  }
  