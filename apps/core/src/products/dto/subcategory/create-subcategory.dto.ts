import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateProductSubCategoryDto {
    @ApiPropertyOptional({ example: '232324gg44545', description: 'ID de la subcategoría' })
    uuid?: string;

    @ApiProperty({ example: 'AHGG', description: 'Codigo de la empresa' })
    readonly companyId: string;

    @ApiProperty({ example: 'AHGG', description: 'id de la categoría' })
    categoryId: string | Types.ObjectId;

    @ApiProperty({ example: 'Herramientas', description: 'Nombre de la subcategoría' })
    readonly name: string;

    @ApiProperty({ example: 'subcategoría de prueba', description: 'Descripción de la subcategoría' })
    readonly description: string;

    @ApiProperty({ example: '100', description: 'Código corto de la subcategoría' })
    readonly shortCode: string;

    @ApiProperty({ example: true, description: 'estado de la subcategoría' })
    readonly active: boolean;

    @ApiProperty({ example: true, description: 'Atributo requerido o no.' })
    readonly required: boolean;
}
