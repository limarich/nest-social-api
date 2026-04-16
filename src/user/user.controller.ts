import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { UserService } from './user.service';
import { Pagination } from 'src/common/interfaces/paginations.interface';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    findAll(@Query() pagination: Pagination) {
        return this.userService.findAll(pagination);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Post()
    create(@Body() userDto: UserCreateDto) {
        return this.userService.create(userDto);
    }

    @Put()
    update(@Body() user: UserUpdateDto) {
        return this.userService.update(user);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}
