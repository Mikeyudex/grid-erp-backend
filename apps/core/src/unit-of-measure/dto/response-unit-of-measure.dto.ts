import { ApiProperty } from '@nestjs/swagger';

export class UnitOfMeasureResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the unit of measure',
    example: '66c52811d5c752b261d28eae',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the unit of measure',
    example: 'Kilogram',
  })
  name: string;

  @ApiProperty({
    description: 'The abbreviation for the unit of measure',
    example: 'kg',
  })
  abbreviation?: string;

  @ApiProperty({
    description: 'The creation date of the unit of measure',
    example: '2024-08-20T18:34:41.342Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update date of the unit of measure',
    example: '2024-08-22T10:15:30.123Z',
  })
  updatedAt: Date;
}
