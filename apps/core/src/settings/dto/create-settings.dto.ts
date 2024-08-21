import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingsDto {

  @ApiPropertyOptional({ example: '232323', description: 'Id de la configuración' })
  uuid?: string;

  @ApiProperty({ example: 'HIO', description: 'Codigo de la compañia' })
  readonly companyId: string;

  @ApiProperty({ example: 'product', description: 'Nombre de la configuración' })
  readonly name: string;

  @ApiProperty({ example: '[{correlativeSku:1000}]', description: 'Valores de la configuración' })
  readonly value: Record<string, any>[];;

}
