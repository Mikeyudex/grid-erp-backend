import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProductDto {
  @ApiPropertyOptional({ example: '232324gg44545', description: 'ID del producto' })
  @IsOptional()
  uuid?: string;

  @ApiProperty({ example: 'Codigo externo', description: '232324343' })
  @IsOptional()
  @IsString({ message: 'El externalId debe ser una cadena de texto.' })
  readonly externalId: string;

  @ApiProperty({ example: 'Codigo de la empresa', description: 'AHU' })
  @IsOptional()
  @IsString({ message: 'El id de la empresa debe ser una cadena de texto.' })
  companyId?: string;

  @ApiProperty({ example: 'Codigo de la bodega', description: '12234' })
  @IsNotEmpty({ message: 'El id de la bodega es un campo requerido.' })
  @IsString({ message: 'El id de la bodega debe ser una cadena de texto.' })
  readonly warehouseId: string;

  @ApiProperty({ example: 'Id del proovedor', description: '12234' })
  @IsNotEmpty({ message: 'El id del proveedor es un campo requerido.' })
  @IsString({ message: 'El id del proveedor debe ser una cadena de texto.' })
  readonly providerId: string;

  @ApiProperty({ example: 'Camiseta', description: 'Nombre del producto' })
  @IsNotEmpty({ message: 'El nombre es un campo requerido.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  readonly name: string;

  @ApiProperty({ example: 'Camiseta manga larga', description: 'Descripción del producto' })
  @IsNotEmpty({ message: 'La descripción es un campo requerido.' })
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  readonly description: string;

  @ApiProperty({ example: 'Id del tipo de producto', description: '12234' })
  @IsNotEmpty({ message: 'El id del tipo de producto es un campo requerido.' })
  @IsString({ message: 'El id del tipo de producto debe ser una cadena de texto.' })
  readonly id_type_product: string;

  @ApiProperty({ example: 'CAM123', description: 'SKU del producto' })
  @IsNotEmpty({ message: 'El sku es un campo requerido.' })
  @IsString({ message: 'El sku debe ser una cadena de texto.' })
  readonly sku: string;

  @ApiProperty({ example: '99272772', description: 'Id de la unidad de medida del producto' })
  /*   @IsNotEmpty({ message: 'La unidad de medida es un campo requerido.' }) */
  @IsOptional()
  @IsString({ message: 'El id de la unidad de medida debe ser una cadena de texto.' })
  unitOfMeasureId?: string;

  @ApiProperty({ example: '99272772', description: 'Id de la lista de impuestos' })
  /* @IsNotEmpty({ message: 'taxId es un campo requerido.' }) */
  @IsOptional()
  @IsString({ message: 'taxId debe ser una cadena.' })
  taxId?: string;

  @ApiProperty({ example: '873827', description: 'Id de la categoría del producto' })
  @IsNotEmpty({ message: 'La categoría es un campo requerido.' })
  @IsString({ message: 'El id de la categoría debe ser una cadena de texto.' })
  readonly id_category: string | Types.ObjectId;

  @ApiProperty({ example: '873827sdd', description: 'Id de la subcategoría del producto' })
  /* @IsNotEmpty({ message: 'La subcategoría es un campo requerido.' }) */
  @IsOptional()
  @IsString({ message: 'El id de la subategoría debe ser una cadena de texto.' })
  id_sub_category?: string;

  @ApiProperty({ example: 10, description: 'Cantidad del producto' })
  @IsNotEmpty({ message: 'La cantidad es un campo requerido.' })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(1, { message: 'La cantidad no puede ser menor que 1.' })
  readonly quantity: number;

  @ApiProperty({ example: 25.00, description: 'Precio de venta del producto' })
  @IsNotEmpty({ message: 'El precio de venta es un campo requerido.' })
  @IsNumber({}, { message: 'El precio de venta debe ser un número.' })
  @Min(0, { message: 'El precio de venta no puede ser menor que 0.' })
  readonly salePrice: number;

  @ApiProperty({ example: 20.00, description: 'Precio de costo del producto' })
  @IsNotEmpty({ message: 'El precio de costo es un campo requerido.' })
  @IsNumber({}, { message: 'El precio de costo debe ser un número.' })
  @Min(0, { message: 'El precio de costo no puede ser menor que 0.' })
  readonly costPrice: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { color: 'rojo', size: 'L' },
    description: 'Atributos personalizados del producto'
  })
  @IsOptional()
  readonly attributes?: Record<string, any>;

  @ApiProperty({ type: 'array', example: ['Conductor', 'Copiloto'], description: 'Tipos de pieza' })
  @IsOptional()
  @IsArray()
  typeOfPieces?: string[];

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { hasBarcode: true, images: ["image1", "image2"] },
    description: 'Configuraciones adicionales al producto'
  })
  @IsOptional()
  readonly additionalConfigs?: Record<string, any>;
}
