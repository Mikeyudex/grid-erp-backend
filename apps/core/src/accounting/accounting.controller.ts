import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dtos/paymentMethod.dto';
import { PaymentMethodService } from './services/paymentMethod.service';
import { AccountService } from './services/account.service';
import { CreateAccountDto, UpdateAccountDto } from './dtos/account.dto';
import { IncomeService } from './services/Income.service';
import { CreateIncomeDto } from './dtos/income.dto';

@Controller('accounting')
export class AccountingController {
    constructor(
        private readonly paymentMethodService: PaymentMethodService,
        private readonly accountService: AccountService,
        private readonly incomeService: IncomeService,
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
    @Post('account/create')
    async createAccount(@Body() CreateAccountDto: CreateAccountDto) {
        return this.accountService.create(CreateAccountDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('account/getAll')
    async getAllAccount() {
        return this.accountService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('account/getById/:id')
    async getByIdAccount(@Param('id') id: string) {
        return this.accountService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('account/update/:id')
    async updateAccount(@Body() UpdateAccountDto: UpdateAccountDto, @Param('id') id: string) {
        return this.accountService.update(id, UpdateAccountDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('account/delete/:id')
    async deleteAccount(@Param('id') id: string) {
        return this.accountService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('account/bulkDelete')
    async bulkDeleteAccount(@Body() payload: Record<string, any>) {
        return this.accountService.bulkDelete(payload?.ids);
    }

    @UseGuards(JwtAuthGuard)
    @Post('income/create')
    async createIncome(@Body() CreateIncomeDto: CreateIncomeDto) {
        return this.incomeService.create(CreateIncomeDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('income/getAll')
    async getAllIncome(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('sortBy') sortBy = 'createdAt',
        @Query('sortOrder') sortOrder: 'asc' | 'desc',
    ) {
        return this.incomeService.findAll(
            { page, limit, search, sortBy, sortOrder }
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('income/getById/:id')
    async getByIdIncome(@Param('id') id: string) {
        return this.incomeService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('income/update/:id')
    async updateIncome(@Body() UpdateIncomeDto: any, @Param('id') id: string) {
        return this.incomeService.update(id, UpdateIncomeDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('income/delete/:id')
    async deleteIncome(@Param('id') id: string) {
        return this.incomeService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('income/bulkDelete')
    async bulkDeleteIncome(@Body() payload: Record<string, any>) {
        return this.incomeService.bulkDelete(payload?.ids);
    }

    /*  @UseGuards(JwtAuthGuard)
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
     } */
}
