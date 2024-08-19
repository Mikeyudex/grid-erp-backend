import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {

  @ApiPropertyOptional({ example: '232323', description: 'Id de la empresa' })
  uuid?: string;

  @ApiProperty({ example: 'HIO', description: 'Codigo de la empresa' })
  readonly companyId: string;

  @ApiProperty({ example: '2098', description: 'Codigo corto de la bodega' })
  readonly warehouseCode: string;

  @ApiProperty({ example: 'Bodega 1', description: 'Nombre de la bodega' })
  readonly name: string;

  @ApiProperty({ example: 'Bodega 1', description: 'Descripción de la bodega' })
  readonly description: string;

  @ApiProperty({ example: 'false', description: 'Activo o inactivo' })
  readonly active: boolean;

}
