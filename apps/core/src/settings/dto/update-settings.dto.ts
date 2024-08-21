import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateSettingsDto } from './create-settings.dto';

export class UpdateSettingsDto extends PartialType(CreateSettingsDto) {

  @ApiPropertyOptional({ example: 'HIO', description: 'Codigo de la compañia' })
  readonly companyId: string;

  @ApiPropertyOptional({ example: 'product', description: 'Nombre de la configuración' })
  readonly name: string;

  @ApiPropertyOptional({ example: '{correlativeSku:1000}', description: 'Valores de la configuración' })
  readonly value: Record<string, any>[];;

}
