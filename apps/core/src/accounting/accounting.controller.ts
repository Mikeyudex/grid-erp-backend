import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dtos/paymentMethod.dto';
import { PaymentMethodService } from './services/paymentMethod.service';

@Controller('accounting')
export class AccountingController {
    constructor(
        private readonly paymentMethodService: PaymentMethodService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('paymentMethod/create')
    async create(@Body() CreatePaymentMethodDto: CreatePaymentMethodDto) {
        return this.paymentMethodService.create(CreatePaymentMethodDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('paymentMethod/getAll')
    async getAll() {
        return this.paymentMethodService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('paymentMethod/getById/:id')
    async getById(@Param('id') id: string) {
        return this.paymentMethodService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('paymentMethod/update/:id')
    async update(@Body() UpdatePaymentMethodDto: UpdatePaymentMethodDto, @Param('id') id: string) {
        return this.paymentMethodService.update(id, UpdatePaymentMethodDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('paymentMethod/delete/:id')
    async delete(@Param('id') id: string) {
        return this.paymentMethodService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('paymentMethod/bulkDelete')
    async bulkDelete(@Body() payload: Record<string, any>) {
        return this.paymentMethodService.bulkDelete(payload?.ids);
    }
}
