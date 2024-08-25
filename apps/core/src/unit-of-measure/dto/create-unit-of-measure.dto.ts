import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUnitOfMeasureDto {
  @ApiProperty({
    description: 'The name of the unit of measure',
    example: 'Kilogram',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The abbreviation for the unit of measure',
    example: 'kg',
    required: false,
  })
  @IsString()
  @IsOptional()
  abbreviation?: string;
}
