import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {

  @ApiPropertyOptional({ example: 'Camiseta', description: 'Nombre del producto' })
  name: string;

  @ApiPropertyOptional({ example: '873827', description: 'Id de la categoría del producto' })
  id_category: string | Types.ObjectId;

  @ApiPropertyOptional({ example: 25.00, description: 'Precio de venta del producto' })
  salePrice: number;

  @ApiPropertyOptional({ example: 20.00, description: 'Precio de costo del producto' })
  costPrice: number;

}
