import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllByCompanyProductsResponseDto {
  @ApiPropertyOptional({ example: '232324gg44545', description: 'ID del producto' })
  uuid?: string;

  @ApiProperty({ example: 'Codigo externo', description: '232324343' })
  externalId: string;

  @ApiProperty({ example: 'Codigo de la empresa', description: 'AHU' })
  companyId: string;

  @ApiProperty({ example: 'Codigo de la bodega', description: '12234' })
  warehouseId: string;

  @ApiProperty({ example: 'Id del proovedor', description: '12234' })
  providerId: string;

  @ApiProperty({ example: 'Camiseta', description: 'Nombre del producto' })
  name: string;

  @ApiProperty({ example: 'Camiseta manga larga', description: 'Descripción del producto' })
  description: string;

  @ApiProperty({ example: 'CAM123', description: 'SKU del producto' })
  sku: string;

  @ApiProperty({ example: '99272772', description: 'Id de la unidad de medida del producto' })
  unitOfMeasureId: string;

  @ApiProperty({ example: '99272772', description: 'Id de la lista de impuestos' })
  taxId: string;

  @ApiProperty({ example: '873827', description: 'Id de la categoría del producto' })
  id_category: string;

  @ApiProperty({ example: 'Transmisión', description: 'Nombre de la categoría del producto' })
  categoryName: string;

  @ApiProperty({ example: '873827sdd', description: 'Id de la subcategoría del producto' })
  id_sub_category: string;

  @ApiProperty({ example: 'Ejes', description: 'Nombre de la subcategoría del producto' })
  subCategoryName: string;

  @ApiProperty({ example: 'Bodega 1', description: 'Nombre de la bodega del producto' })
  warehouseName: string;

  @ApiProperty({ example: 10, description: 'Cantidad del producto' })
  quantity: number;

  @ApiProperty({ example: 25.00, description: 'Precio de venta del producto' })
  salePrice: number;

  @ApiProperty({ example: 20.00, description: 'Precio de costo del producto' })
  costPrice: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { color: 'rojo', size: 'L' },
    description: 'Atributos personalizados del producto'
  })
  attributes: Record<string, any>;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { hasBarcode: true, images: ["image1", "image2"] },
    description: 'Configuraciones adicionales al producto'
  })
  additionalConfigs: Record<string, any>;
}
