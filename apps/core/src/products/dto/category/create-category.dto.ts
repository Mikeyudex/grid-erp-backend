import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiPropertyOptional({ example: '232324gg44545', description: 'ID de la categoría' })
    uuid?: string;

    @ApiProperty({ example: 'AHGG', description: 'Codigo de la empresa' })
    readonly companyId: string;

    @ApiProperty({ example: 'Herramientas', description: 'Nombre de la categoría' })
    readonly name: string;

    @ApiProperty({ example: 'Categoría de prueba', description: 'Descripción de la categoría' })
    readonly description: string;

    @ApiProperty({ example: '100', description: 'Código corto de la categoría' })
    shortCode: string;

    @ApiProperty({ example: true, description: 'estado de la categoría' })
    readonly active: boolean;

    @ApiProperty({ example: true, description: 'Atributo requerido o no.' })
    readonly required: boolean;
}
