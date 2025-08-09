import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import { DebtService } from './debt.service';
import { CreateDebtDto, UpdateDebtDto } from './debt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('debt')
export class DebtController {
    constructor(private readonly debtService: DebtService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getDebts(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('sortBy') sortBy = 'createdAt',
        @Query('sortOrder') sortOrder: 'asc' | 'desc',) {
        return this.debtService.getDebts({ page, limit, search, sortBy, sortOrder });
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getDebtById(@Param('id') id: string) {
        return this.debtService.getDebtById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createDebt(@Body() createDebtDto: CreateDebtDto) {
        return this.debtService.createDebt(createDebtDto);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateDebt(@Param('id') id: string, @Body() updateDebtDto: UpdateDebtDto) {
        return this.debtService.updateDebt(id, updateDebtDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteDebt(@Param('id') id: string) {
        return this.debtService.deleteDebt(id);
    }
}
