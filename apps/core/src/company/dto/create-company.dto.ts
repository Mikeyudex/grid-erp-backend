import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {

  @ApiPropertyOptional({ example: '232323', description: 'Id de la empresa' })
  uuid?: string;

  @ApiProperty({ example: 'Codigo de la empresa', description: '3456' })
  readonly companyCode: string;

  @ApiProperty({ example: 'Empresa de servicios', description: 'Nombre de la empresa' })
  readonly name: string;

  @ApiProperty({ example: 'Empresa de servicios varios', description: 'Descripción de la empresa' })
  readonly description: string;

  @ApiProperty({ example: 'false', description: 'Activo o inactivo' })
  readonly active: boolean;

}
