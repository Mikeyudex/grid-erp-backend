import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductSubCategoryDto {

    @ApiPropertyOptional({ example: 'Herramientas', description: 'Nombre de la subcategoría' })
    readonly name: string;

    @ApiPropertyOptional({ example: 'subcategoría de prueba', description: 'Descripción de la subcategoría' })
    readonly description: string;

    @ApiPropertyOptional({ example: true, description: 'estado de la subcategoría' })
    readonly active: boolean;

    @ApiPropertyOptional({ example: true, description: 'Atributo requerido o no.' })
    readonly required: boolean;
}
