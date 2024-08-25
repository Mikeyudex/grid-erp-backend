import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UnitOfMeasureService } from './unit-of-measure.service';
import { CreateUnitOfMeasureDto } from './dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from './dto/update-unit-of-measure.dto';
import { UnitOfMeasure } from './unit-of-measure.schema';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Unit of Measure')
@Controller('units')
export class UnitOfMeasureController {
  constructor(private readonly unitOfMeasureService: UnitOfMeasureService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create a new Unit of Measure' })
  async create(@Body() createUnitOfMeasureDto: CreateUnitOfMeasureDto): Promise<UnitOfMeasure> {
    return this.unitOfMeasureService.create(createUnitOfMeasureDto);
  }

  @Get('/getAll')
  @ApiOperation({ summary: 'Get all Units of Measure' })
  async findAll(): Promise<UnitOfMeasure[]> {
    return this.unitOfMeasureService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Unit of Measure by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the Unit of Measure to retrieve' })
  async findOne(@Param('id') id: string): Promise<UnitOfMeasure> {
    return this.unitOfMeasureService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Unit of Measure by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the Unit of Measure to update' })
  async update(
    @Param('id') id: string,
    @Body() updateUnitOfMeasureDto: UpdateUnitOfMeasureDto,
  ): Promise<UnitOfMeasure> {
    return this.unitOfMeasureService.update(id, updateUnitOfMeasureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Unit of Measure by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the Unit of Measure to delete' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.unitOfMeasureService.remove(id);
  }
}
