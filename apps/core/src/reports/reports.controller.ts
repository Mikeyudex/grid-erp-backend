import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('cumulative-sales-report')
    async cumulativeSalesReport(
        @Query('zoneId') zoneId: string,
        @Query('advisorId') advisorId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string) {
        const params = {
            zoneId,
            advisorId,
            startDate,
            endDate,
        };
        return this.reportsService.CumulativeSalesReport(params);
    }

    @UseGuards(JwtAuthGuard)
    @Get('detailed-sales-report')
    async detailedSalesReport(
        @Query('zoneId') zoneId: string,
        @Query('advisorId') advisorId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string) {
        const params = {
            zoneId,
            advisorId,
            startDate,
            endDate,
        };
        return this.reportsService.detailedSalesReport(params);
    }
}
