import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {

    @ApiPropertyOptional({ example: 'Codigo de la empresa', description: '3456' })
    readonly companyCode: string;

    @ApiPropertyOptional({ example: 'Empresa de servicios', description: 'Nombre de la empresa' })
    readonly name: string;

    @ApiPropertyOptional({ example: 'Empresa de servicios varios', description: 'Descripción de la empresa' })
    readonly description: string;

    @ApiPropertyOptional({ example: 'false', description: 'Activo o inactivo' })
    readonly active: boolean;

}
