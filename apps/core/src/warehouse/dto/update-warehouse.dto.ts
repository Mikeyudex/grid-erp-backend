import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {

    @ApiPropertyOptional({ example: '2098', description: 'Codigo corto de la bodega' })
    readonly warehouseCode: string;

    @ApiPropertyOptional({ example: 'Bodega 1', description: 'Nombre de la bodega' })
    readonly name: string;

    @ApiPropertyOptional({ example: 'Bodega 1', description: 'Descripción de la bodega' })
    readonly description: string;

    @ApiPropertyOptional({ example: 'false', description: 'Activo o inactivo' })
    readonly active: boolean;

}
