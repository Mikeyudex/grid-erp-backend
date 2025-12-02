import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('resources')
export class ResourceController {

    constructor(
        private readonly resourceService: ResourceService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAll() {
        return this.resourceService.getAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.resourceService.getOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    create(@Body() payload: CreateResourceDto) {
        return this.resourceService.create(payload);
    }
}
