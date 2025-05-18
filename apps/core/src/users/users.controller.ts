import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dtos/users.dto';
import { CreateZoneDto, UpdateZoneDto } from './dtos/zones.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  @ApiOperation({
    summary: 'List of users',
  })
  findAll(@Query('filter') filter: string, @Query('value') value: string) {
    return this.usersService.findAll(filter, value);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post('/create')
  create(@Body() payload: CreateUserDto) {
    return this.usersService.create(payload);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.usersService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/zones/create')
  createZone(@Body() payload: CreateZoneDto) {
    return this.usersService.createZone(payload);
  }

  @Get('/zones/getAll')
  getAllZones() {
    return this.usersService.getAllZones();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/zones/getById/:id')
  getZoneById(@Param('id') id: string) {
    return this.usersService.getZoneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/zones/update/:id')
  updateZone(@Param('id') id: string, @Body() payload: UpdateZoneDto) {
    return this.usersService.updateZone(id, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/zones/delete/:id')
  deleteZone(@Param('id') id: string) {
    return this.usersService.deleteZone(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/zones/bulkDelete')
  bulkDeleteZone(@Body() payload: Record<string, any>) {
    return this.usersService.bulkDeleteZone(payload?.ids);
  }


  @Get('/generateQrCode/:email')
  async generate(@Param('email') email: string) {
    if (!email) throw new NotFoundException({
      statusCode: 404,
      message: 'Email no encontrado',
      error: 'Email no encontrado',
    });
    return this.usersService.generateSecret(email);
  }

  @Post('/verifyOtp')
  verify(@Body() body: { email: string; otp: string }) {
    if (!body.email || !body.otp) throw new NotFoundException({
      statusCode: 400,
      message: 'Datos incorrectos',
      error: 'Datos incorrectos',
    });
    return this.usersService.verifyotp(body.email, body.otp);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    if (!email) throw new NotFoundException({
      statusCode: 400,
      message: 'El campo email es obligatorio',
      error: 'El campo email es obligatorio',
    });
    return this.usersService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    return this.usersService.resetPassword(token, newPassword);
  }
}