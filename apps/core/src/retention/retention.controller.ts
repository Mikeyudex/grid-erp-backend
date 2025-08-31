import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RetentionService } from './retention.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('retention')
export class RetentionController {
    constructor(private readonly retentionService: RetentionService) { }

    @UseGuards(JwtAuthGuard)
    @Get('getAll')
    async getAllRetention() {
        return this.retentionService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('getById/:id')
    async getByIdRetention(@Param('id') id: string) {
        return this.retentionService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createRetention(@Body() retention: any) {
        return this.retentionService.create(retention);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/:id')
    async updateRetention(@Body() retention: any, @Param('id') id: string) {
        return this.retentionService.update(id, retention);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deleteRetention(@Param('id') id: string) {
        return this.retentionService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('bulkDelete')
    async bulkDeleteRetention(@Body() payload: Record<string, any>) {
        return this.retentionService.bulkDelete(payload?.ids);
    }
}
