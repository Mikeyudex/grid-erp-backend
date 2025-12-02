import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AddResourceDto, CreateRoleUserDto, UpdateRoleUserDto } from './role-user.dto';
import { RoleUserService } from './role-user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('role-user')
export class RoleUserController {
    constructor(
        private readonly roleUserService: RoleUserService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    create(@Body() payload: CreateRoleUserDto) {
        return this.roleUserService.create(payload);
    }

    @UseGuards(JwtAuthGuard)
    @Put('/update/:id')
    update(@Param('id') id: string, @Body() payload: UpdateRoleUserDto) {
        return this.roleUserService.update(payload);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAll() {
        return this.roleUserService.getAll();
    }

    @UseGuards(JwtAuthGuard)
    @Put('/add-resources/:id')
    addResource(@Param('id') id: string, @Body() payload: AddResourceDto) {
        return this.roleUserService.addResource(payload, id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/delete-role/:id')
    deleteResource(@Param('id') id: string) {
        return this.roleUserService.deleteRole(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/get-resources-by-role/:id')
    getResourcesByRole(@Param('id') id: string) {
        return this.roleUserService.getResourcesByRole(id);
    }
}
