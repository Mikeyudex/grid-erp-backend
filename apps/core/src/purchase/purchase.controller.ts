import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('purchase')
export class PurchaseController {
    constructor(
        private readonly purchaseService: PurchaseService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createPurchase(@Body() createPurchaseDto: any) {
        return this.purchaseService.create(createPurchaseDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('getAll')
    async getAllPurchase(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('sortBy') sortBy = 'createdAt',
        @Query('sortOrder') sortOrder: 'asc' | 'desc',
    ) {
        return this.purchaseService.findAll(
            { page, limit, search, sortBy, sortOrder }
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('getAllByProvider/:providerId')
    async getAllPurchaseByProvider(
        @Param('providerId') providerId: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('sortBy') sortBy = 'createdAt',
        @Query('sortOrder') sortOrder: 'asc' | 'desc',
    ) {
        return this.purchaseService.findAllByProvider(
            providerId,
            { page, limit, search, sortBy, sortOrder }
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('getById/:id')
    async getPurchaseById(@Param('id') id: string) {
        return this.purchaseService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/:id')
    async updatePurchase(@Body() updatePurchaseDto: any, @Param('id') id: string) {
        return this.purchaseService.update(id, updatePurchaseDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deletePurchase(@Param('id') id: string) {
        return this.purchaseService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('bulkDelete')
    async bulkDeletePurchase(@Body() payload: Record<string, any>) {
        return this.purchaseService.bulkDelete(payload?.ids);
    }
}
