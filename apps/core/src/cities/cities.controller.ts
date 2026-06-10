import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { AuthGuard } from '@nestjs/passport'; // O el guard que uses para tus rutas protegidas

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async findAll(@Query('search') search: string) {
    const data = await this.citiesService.findAll(search);
    return { data, message: 'Ciudades obtenidas correctamente', status: 200 };
  }

  @Post()
  async create(@Body() createCityDto: any) {
    const data = await this.citiesService.create(createCityDto);
    return { data, message: 'Ciudad creada exitosamente', status: 201 };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCityDto: any) {
    const data = await this.citiesService.update(id, updateCityDto);
    return { data, message: 'Ciudad actualizada exitosamente', status: 200 };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.citiesService.remove(id);
    return { message: 'Ciudad eliminada exitosamente', status: 200 };
  }
}
