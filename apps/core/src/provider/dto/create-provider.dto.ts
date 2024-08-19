import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {

  @ApiPropertyOptional({ example: '232323', description: 'Id de la empresa' })
  uuid?: string;

  @ApiProperty({ example: 'HIO', description: 'Codigo de la empresa' })
  readonly companyId: string;

  @ApiProperty({ example: '4567', description: 'Codigo corto del proveedor' })
  readonly providerCode: string;

  @ApiProperty({ example: 'codavas', description: 'Nombre del proveedor' })
  readonly name: string;

  @ApiProperty({ example: 'codavas sección norte', description: 'Descripción del proveedor' })
  readonly description: string;

  @ApiProperty({ example: 'false', description: 'Activo o inactivo' })
  readonly active: boolean;

}
