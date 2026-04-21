import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PostCreateDto } from './dto/post.create.dto';
import { PostUpdateDto } from './dto/post.update.dto';
import { TokenPayload } from 'src/common/decorators/token_payload.decorator';
import { PostService } from './post.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enum/roles.enum';
import { Pagination } from 'src/common/interfaces/paginations.interface';
import { PostReactionDto } from './dto/post-reaction.dto';
import { PostReactionService } from './post-reaction.service';

@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly postReactionService: PostReactionService
    ) { }

    @Post()
    create(@Body() dto: PostCreateDto, @TokenPayload('sub') userId: string) {
        return this.postService.create(dto, userId);
    }

    @Get()
    findAll(@Query() pagination: Pagination) {
        return this.postService.findAll(pagination);
    }

    @Get('my-posts')
    findCurrentUserPosts(@TokenPayload('sub') userId: string, @Query() pagination: Pagination) {
        return this.postService.findCurrentUserPosts(userId, pagination);
    }

    @Get('user/:userId')
    findUserPosts(@Param('userId') userId: string, @Query() pagination: Pagination) {
        return this.postService.findUserPosts(userId, pagination);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postService.findOne(id);
    }

    @Put()
    update(@Body() dto: PostUpdateDto, @TokenPayload('sub') userId: string) {
        return this.postService.update(dto, userId);
    }

    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string, @TokenPayload('sub') userId: string) {
        return this.postService.remove(id, userId);
    }

    @Post('react/:postId')
    react(@Param('postId') postId: string, @TokenPayload('sub') userId: string, @Body() dto: PostReactionDto) {
        return this.postReactionService.react(postId, userId, dto.type);
    }

}
