import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    Query,
  } from '@nestjs/common';
  import { ApiOperation, ApiTags } from '@nestjs/swagger';
  
  import { UsersService } from './users.service';
  import { CreateUserDto, UpdateUserDto } from './dtos/users.dto';
  
  @ApiTags('users')
  @Controller('users')
  export class UsersController {
    constructor(private usersService: UsersService) {}
  
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
  }