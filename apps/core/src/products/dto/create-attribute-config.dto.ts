import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttributeConfigDto {
    @ApiPropertyOptional({ example: '232324gg44545', description: 'ID del atributo del producto' })
    uuid?: string;

    @ApiProperty({ example: 'Codigo de la empresa', description: 'AHU' })
    readonly companyId: string;

    @ApiProperty({ example: 'Camiseta', description: 'Nombre del atributo del producto' })
    readonly name: string;

    @ApiProperty({ example: 'Camiseta', description: 'Label del atributo del producto' })
    readonly label: string;

    @ApiProperty({ example: 'Camiseta manga larga', description: 'Descripción del atributo delproducto' })
    readonly description: string;

    @ApiProperty({ example: 'select', description: 'tipo del atributo' })
    readonly type: string;

    @ApiProperty({
        example: [
            "rojo",
            "azul",
            "verde",
            "negro"
        ], description: 'Opciones del select'
    })
    readonly options: string[];

    @ApiProperty({ example: true, description: 'Atributo requerido o no.' })
    readonly required: boolean;
}
