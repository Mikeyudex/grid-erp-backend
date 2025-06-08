import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dtos/paymentMethod.dto';
import { PaymentMethodService } from './services/paymentMethod.service';
import { RelatedToService } from './services/relatedTo.service';
import { CreateRelatedToDto, UpdateRelatedToDto } from './dtos/relatedTo.dto';

@Controller('accounting')
export class AccountingController {
    constructor(
        private readonly paymentMethodService: PaymentMethodService,
        private readonly relatedToService: RelatedToService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('paymentMethod/create')
    async createPaymentMethod(@Body() CreatePaymentMethodDto: CreatePaymentMethodDto) {
        return this.paymentMethodService.create(CreatePaymentMethodDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('paymentMethod/getAll')
    async getAllPaymentMethod() {
        return this.paymentMethodService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('paymentMethod/getById/:id')
    async getByIdPaymentMethod(@Param('id') id: string) {
        return this.paymentMethodService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('paymentMethod/update/:id')
    async updatePaymentMethod(@Body() UpdatePaymentMethodDto: UpdatePaymentMethodDto, @Param('id') id: string) {
        return this.paymentMethodService.update(id, UpdatePaymentMethodDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('paymentMethod/delete/:id')
    async deletePaymentMethod(@Param('id') id: string) {
        return this.paymentMethodService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('paymentMethod/bulkDelete')
    async bulkDeletePaymentMethod(@Body() payload: Record<string, any>) {
        return this.paymentMethodService.bulkDelete(payload?.ids);
    }

    @UseGuards(JwtAuthGuard)
    @Post('relatedTo/create')
    async createRelatedTo(@Body() CreateRelatedToDto: CreateRelatedToDto) {
        return this.relatedToService.create(CreateRelatedToDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('relatedTo/getAll')
    async getAllRelatedTo() {
        return this.relatedToService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('relatedTo/getById/:id')
    async getByIdRelatedTo(@Param('id') id: string) {
        return this.relatedToService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('relatedTo/update/:id')
    async updateRelatedTo(@Body() UpdateRelatedToDto: UpdateRelatedToDto, @Param('id') id: string) {
        return this.relatedToService.update(id, UpdateRelatedToDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('relatedTo/delete/:id')
    async deleteRelatedTo(@Param('id') id: string) {
        return this.relatedToService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('relatedTo/bulkDelete')
    async bulkDeleteRelatedTo(@Body() payload: Record<string, any>) {
        return this.relatedToService.bulkDelete(payload?.ids);
    }
}
