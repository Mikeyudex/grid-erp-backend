import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { TypeOfCustomerService } from "../services/typeOfCustomer.service";
import { CreateTypeOfCustomerDto } from "../dtos/typeOfCustomer.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";


@Controller('typeOfCustomer')
export class TypeOfCustomerController {

    constructor(
        private readonly typeOfCustomerService: TypeOfCustomerService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createTypeOfCustomer(@Body() createTypeOfCustomerDto: CreateTypeOfCustomerDto) {
        return this.typeOfCustomerService.create(createTypeOfCustomerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('getAll')
    async getAllTypeOfCustomers() {
        return this.typeOfCustomerService.getAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('getById/:id')
    async getTypeOfCustomerById( @Param('id') id: string) {
        return this.typeOfCustomerService.getById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/:id')
    async updateTypeOfCustomer(@Body() updateTypeOfCustomerDto: CreateTypeOfCustomerDto, @Param('id') id: string) {
        return this.typeOfCustomerService.update(updateTypeOfCustomerDto, id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deleteTypeOfCustomer( @Param('id') id: string) {
        return this.typeOfCustomerService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('bulkDelete')
    async bulkDeleteTypeOfCustomer(@Body() payload: Record<string, any>) {
        return this.typeOfCustomerService.bulkDelete(payload?.ids);
    }

}