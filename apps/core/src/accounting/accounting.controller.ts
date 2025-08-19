import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dtos/paymentMethod.dto';
import { PaymentMethodService } from './services/paymentMethod.service';
import { AccountService } from './services/account.service';
import { CreateAccountDto, UpdateAccountDto } from './dtos/account.dto';
import { IncomeService } from './services/Income.service';
import { CreateIncomeDto } from './dtos/income.dto';
import { TypeOfExpenseService } from './services/type-of-expense.service';
import { CreateTypeOfExpenseDto, UpdateTypeOfExpenseDto } from './dtos/type-of-expense.dto';

@Controller('accounting')
export class AccountingController {
    constructor(
        private readonly paymentMethodService: PaymentMethodService,
        private readonly accountService: AccountService,
        private readonly incomeService: IncomeService,
        private readonly typeOfExpenseService: TypeOfExpenseService,
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
    @Get('income/getAllByCustomerAndTypeOperation/:customerId/:typeOperation')
    async getAllIncomeByUserId(
        @Param('customerId') customerId: string,
        @Param('typeOperation') typeOperation: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('sortBy') sortBy = 'createdAt',
        @Query('sortOrder') sortOrder: 'asc' | 'desc',
    ) {
        if (!customerId || !typeOperation) {
            throw new BadRequestException('CustomerId and TypeOperation are required');
        }
        return this.incomeService.findAllByCustomerAndTypeOperation(
            customerId,
            typeOperation,
            { page, limit, search, sortBy, sortOrder });
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

    @UseGuards(JwtAuthGuard)
    @Post('type-of-expense/create')
    async createTypeOfExpense(@Body() CreateTypeOfExpenseDto: CreateTypeOfExpenseDto) {
        return this.typeOfExpenseService.create(CreateTypeOfExpenseDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('type-of-expense/getAll')
    async getAllTypeOfExpense() {
        return this.typeOfExpenseService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('type-of-expense/getById/:id')
    async getByIdTypeOfExpense(@Param('id') id: string) {
        return this.typeOfExpenseService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('type-of-expense/update/:id')
    async updateTypeOfExpense(@Body() UpdateTypeOfExpenseDto: UpdateTypeOfExpenseDto, @Param('id') id: string) {
        return this.typeOfExpenseService.update(id, UpdateTypeOfExpenseDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('type-of-expense/delete/:id')
    async deleteTypeOfExpense(@Param('id') id: string) {
        return this.typeOfExpenseService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('type-of-expense/bulkDelete')
    async bulkDeleteTypeOfExpense(@Body() payload: Record<string, any>) {
        return this.typeOfExpenseService.bulkDelete(payload?.ids);
    }
}
