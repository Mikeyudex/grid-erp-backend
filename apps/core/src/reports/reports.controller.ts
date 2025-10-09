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

    @UseGuards(JwtAuthGuard)
    @Get('product-sales-report')
    async productSalesReport(
        @Query('zoneId') zoneId: string,
        @Query('advisorId') advisorId: string,
        @Query('clientId') clientId: string,
        @Query('productId') productId: string,
        @Query('matType') matType: string,
        @Query('materialType') materialType: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('global') global: boolean) {
        const params = {
            zoneId,
            advisorId,
            clientId,
            productId,
            matType,
            materialType,
            startDate,
            endDate,
            global,
        };
        return this.reportsService.ProductSalesReport(params);
    }

    @UseGuards(JwtAuthGuard)
    @Get('accounts-receivable-report')//CXC (Consolidado por cliente - Detallado por pedido): global = Consolidado por cliente, detallado = Detallado por pedido
    async accountsReceivableReport(
        @Query('clientId') clientId: string,
        @Query('zoneId') zoneId: string,
        @Query('advisorId') advisorId: string,
        @Query('mode') mode: 'global' | 'detallado' = 'global',
    ) {
        const params = {
            clientId,
            zoneId,
            advisorId,
            mode,
        };
        return this.reportsService.AccountsReceivableReport(params);
    }

    @UseGuards(JwtAuthGuard)
    @Get('bank-accounts-balance-report') //Reporte de saldos de cuentas bancarias
    async bankAccountsBalanceReport(
        @Query('typeAccount') typeAccount: string,
        @Query('bankAccount') bankAccount: string,
    ) {
        const params = {
            typeAccount,
            bankAccount,
        };
        return this.reportsService.getBankAccountsBalanceReport(params);
    }
}
