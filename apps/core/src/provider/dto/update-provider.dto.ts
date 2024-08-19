import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProviderDto } from './create-provider.dto';

export class UpdateProviderDto extends PartialType(CreateProviderDto) {

    @ApiPropertyOptional({ example: '4567', description: 'Codigo corto del proveedor' })
    readonly warehouseCode: string;

    @ApiPropertyOptional({ example: 'codavas', description: 'Nombre del proveedor' })
    readonly name: string;

    @ApiPropertyOptional({ example: 'codavas sección norte', description: 'Descripción del proveedor' })
    readonly description: string;

    @ApiPropertyOptional({ example: 'false', description: 'Activo o inactivo' })
    readonly active: boolean;

}
