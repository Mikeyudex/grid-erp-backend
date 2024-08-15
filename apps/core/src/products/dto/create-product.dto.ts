import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Codigo externo', description: '232324343' })
  readonly externalId: string;

  @ApiProperty({ example: 'Codigo de la empresa', description: 'AHU' })
  readonly companyId: string;

  @ApiProperty({ example: 'Codigo de la bodega', description: '12234' })
  readonly warehouseId: string;

  @ApiProperty({ example: 'Id del proovedor', description: '12234' })
  readonly providerId: string;

  @ApiProperty({ example: 'Camiseta', description: 'Nombre del producto' })
  readonly name: string;

  @ApiProperty({ example: 'Camiseta manga larga', description: 'Descripción del producto' })
  readonly description: string;

  @ApiProperty({ example: 'CAM123', description: 'SKU del producto' })
  readonly sku: string;

  @ApiProperty({ example: '873827', description: 'Id de la categoría del producto' })
  readonly id_category: string;

  @ApiProperty({ example: '873827sdd', description: 'Id de la subcategoría del producto' })
  readonly id_sub_category: string;

  @ApiProperty({ example: 10, description: 'Stock del producto' })
  readonly stock: number;

  @ApiProperty({ example: 25.00, description: 'Precio del producto' })
  readonly price: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { color: 'rojo', size: 'L' },
    description: 'Atributos personalizados del producto'
  })
  readonly attributes: Record<string, any>;
}
