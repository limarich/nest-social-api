import { BadRequestException, Body, ConflictException, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
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
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
}
