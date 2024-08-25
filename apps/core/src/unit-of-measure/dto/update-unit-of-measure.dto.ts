import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUnitOfMeasureDto } from './create-unit-of-measure.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUnitOfMeasureDto extends PartialType(CreateUnitOfMeasureDto) {
  @ApiProperty({
    description: 'The name of the unit of measure',
    example: 'Kilogram',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The abbreviation for the unit of measure',
    example: 'kg',
    required: false,
  })
  @IsString()
  @IsOptional()
  abbreviation?: string;
}
