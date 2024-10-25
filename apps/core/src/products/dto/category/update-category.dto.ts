import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {

    @ApiPropertyOptional({ example: 'AHGG', description: 'Codigo de la empresa' })
    readonly companyId: string;

    @ApiPropertyOptional({ example: 'Herramientas', description: 'Nombre de la categoría' })
    readonly name: string;

    @ApiPropertyOptional({ example: 'Categoría de prueba', description: 'Descripción de la categoría' })
    readonly description: string;

    @ApiPropertyOptional({ example: '100', description: 'Código corto de la categoría' })
    readonly shortCode: string;

    @ApiPropertyOptional({ example: true, description: 'estado de la categoría' })
    readonly active: boolean;

    @ApiPropertyOptional({ example: true, description: 'Atributo requerido o no.' })
    readonly required: boolean;
}
