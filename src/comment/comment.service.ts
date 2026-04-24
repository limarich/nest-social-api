import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ICommentService } from './interface/comment.service.interface';
import { Comment } from './entity/comment.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Pagination } from 'src/common/interfaces/paginations.interface';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService implements ICommentService {

    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async createComment(dto: CreateCommentDto, userId: string): Promise<CommentResponseDto> {
        const post = await this.postRepository.findOneBy({ id: dto.postId });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const comment = this.commentRepository.create({
            content: dto.content,
            post: post,
            user: user,
        });

        return await this.commentRepository.save(comment);
    }
    async createReply(dto: CreateReplyDto, userId: string): Promise<CommentResponseDto> {
        const parentComment = await this.commentRepository.findOneBy({ id: dto.parentId });

        if (!parentComment) {
            throw new NotFoundException("Parent comment not found");
        }

        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new NotFoundException("User not found");
        }
        const reply = await this.commentRepository.create({
            content: dto.content,
            postId: parentComment.postId,
            userId: user.id,
            parentId: parentComment.id,
        })

        return await this.commentRepository.save(reply);

    }
    async getComments(postId: string, pagination: Pagination = {}): Promise<CommentResponseDto[]> {
        const { limit = 10, page = 1 } = pagination;
        const skip = (page - 1) * limit;
        return this.commentRepository.find({
            where: { postId, parentId: IsNull() },
            relations: ['user'],
            skip,
            take: limit,
        });
    }
    async getReplies(commentId: string, pagination: Pagination = {}): Promise<CommentResponseDto[]> {
        const { limit = 10, page = 1 } = pagination;
        const skip = (page - 1) * limit;
        return this.commentRepository.find({
            where: { parentId: commentId },
            relations: ['user'],
            skip,
            take: limit,
        });
    }
    async updateComment(dto: UpdateCommentDto, userId: string): Promise<CommentResponseDto> {
        const comment = await this.commentRepository.findOneBy({ id: dto.commentId });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.userId !== userId) {
            throw new UnauthorizedException('You are not authorized to update this comment');
        }

        comment.content = dto.content;
        return await this.commentRepository.save(comment);
    }
    async deleteComment(commentId: string, userId: string): Promise<void> {
        const comment = await this.commentRepository.findOneBy({ id: commentId });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.userId !== userId) {
            throw new UnauthorizedException('You are not authorized to delete this comment');
        }

        await this.commentRepository.remove(comment);
    }
}
