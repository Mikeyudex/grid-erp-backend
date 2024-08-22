import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ example: '127ghs5ghs45ash', description: 'Id del producto' })
  readonly uuid: string;

  @ApiPropertyOptional({ example: 'Codigo externo', description: '232324343' })
  readonly externalId: string;

  @ApiPropertyOptional({ example: 'Codigo de la empresa', description: 'AHU' })
  readonly companyId: string;

  @ApiPropertyOptional({ example: 'Codigo de la bodega', description: '12234' })
  readonly warehouseId: string;

  @ApiPropertyOptional({ example: 'Id del proovedor', description: '12234' })
  readonly providerId: string;

  @ApiPropertyOptional({ example: 'Camiseta', description: 'Nombre del producto' })
  readonly name: string;

  @ApiPropertyOptional({ example: 'Camiseta manga larga', description: 'Descripción del producto' })
  readonly description: string;

  @ApiPropertyOptional({ example: 'CAM123', description: 'SKU del producto' })
  readonly sku: string;

  @ApiPropertyOptional({ example: '873827', description: 'Id de la categoría del producto' })
  readonly id_category: string;

  @ApiPropertyOptional({ example: '873827sdd', description: 'Id de la subcategoría del producto' })
  readonly id_sub_category: string;

  @ApiPropertyOptional({ example: 25.00, description: 'Precio de venta del producto' })
  readonly salePrice: number;

  @ApiPropertyOptional({ example: 20.00, description: 'Precio de costo del producto' })
  readonly costPrice: number;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { color: 'rojo', size: 'L' },
    description: 'Atributos personalizados del producto'
  })
  readonly attributes?: Record<string, any>;
}
