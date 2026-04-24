import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TokenPayload } from 'src/common/decorators/token_payload.decorator';
import { Pagination } from 'src/common/interfaces/paginations.interface';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enum/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('comment')
export class CommentController {

    constructor(private readonly commentService: CommentService) { }

    @Get(':postId')
    async getComments(@Param('postId') postId: string, @Query() pagination: Pagination): Promise<CommentResponseDto[]> {
        return this.commentService.getComments(postId, pagination);
    }

    @Get('replies/:commentId')
    async getReplies(@Param('commentId') commentId: string, @Query() pagination: Pagination): Promise<CommentResponseDto[]> {
        return this.commentService.getReplies(commentId, pagination);
    }

    @Post()
    async createComment(@Body() dto: CreateCommentDto, @TokenPayload('sub') userId: string): Promise<CommentResponseDto> {
        return this.commentService.createComment(dto, userId);
    }

    @Post('reply')
    async createReply(@Body() dto: CreateReplyDto, @TokenPayload('sub') userId: string): Promise<CommentResponseDto> {
        return this.commentService.createReply(dto, userId);
    }

    @Put()
    async updateComment(@Body() dto: UpdateCommentDto, @TokenPayload('sub') userId: string): Promise<CommentResponseDto> {
        return this.commentService.updateComment(dto, userId);
    }

    @Delete(':commentId')
    @Roles(UserRole.ADMIN)
    async deleteComment(@Param('commentId') commentId: string, @TokenPayload('sub') userId: string): Promise<void> {
        return this.commentService.deleteComment(commentId, userId);
    }
}
