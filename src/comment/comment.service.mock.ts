import { randomUUID } from "crypto";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ICommentService } from "./interface/comment.service.interface";
import { Comment } from "./entity/comment.entity";
import { Post } from "src/post/entity/post.entity";
import { User } from "src/user/entity/user.entity";
import { UserServiceMock } from "src/user/user.service.mock";
import { PostServiceMock } from "src/post/post.service.mock";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CreateReplyDto } from "./dto/create-reply.dto";

@Injectable()
export class CommentServiceMock implements ICommentService {
    private comments: Comment[] = [];

    constructor(
        private readonly userService: UserServiceMock,
        private readonly postService: PostServiceMock,
    ) { }

    public init() {
        this.comments = [
            {
                id: 'abc-123',
                postId: 'abc-123',
                content: 'comment 1',
                userId: 'abc-123',
                createdAt: new Date(),
                updatedAt: new Date(),
                repliesCount: 0,
                parent: null,
                parentId: null,
                replies: [],
                post: new Post(),
                user: new User(),
            }
        ];
    }

    private async validatePostExists(postId: string): Promise<void> {
        await this.postService.findOne(postId);
    }

    private async validateUserExists(userId: string): Promise<void> {
        await this.userService.findOne(userId);
    }

    async createComment(dto: CreateCommentDto, userId: string): Promise<Comment> {
        await this.validatePostExists(dto.postId);
        await this.validateUserExists(userId);

        const newComment: Comment = {
            id: randomUUID(),
            postId: dto.postId,
            content: dto.content,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            repliesCount: 0,
            parent: null,
            parentId: null,
            replies: [],
            post: new Post(),
            user: new User(),
        };

        this.comments.push(newComment);
        return newComment;
    }

    async createReply(dto: CreateReplyDto, userId: string): Promise<Comment> {
        await this.validateUserExists(userId);

        const parentComment = this.comments.find((comment) => comment.id === dto.parentId);

        if (!parentComment) {
            throw new NotFoundException("Parent comment not found");
        }

        const newComment: Comment = {
            id: randomUUID(),
            postId: parentComment.postId,
            content: dto.content,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            repliesCount: 0,
            parent: parentComment,
            parentId: dto.parentId,
            replies: [],
            post: new Post(),
            user: new User(),
        };

        this.comments.push(newComment);
        return newComment;
    }

    async getComments(postId: string): Promise<Comment[]> {
        return this.comments.filter((comment) => comment.postId === postId && comment.parentId === null);
    }

    async getReplies(commentId: string): Promise<Comment[]> {
        return this.comments.filter((comment) => comment.parentId === commentId);
    }

    async updateComment(dto: UpdateCommentDto, userId: string): Promise<Comment> {
        const comment = this.comments.find((comment) => comment.id === dto.commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        if (comment.userId !== userId) {
            throw new UnauthorizedException("You are not authorized to update this comment");
        }

        comment.content = dto.content;
        comment.updatedAt = new Date();
        return comment;
    }

    async deleteComment(commentId: string, userId: string): Promise<void> {
        const comment = this.comments.find((comment) => comment.id === commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        if (comment.userId !== userId) {
            throw new UnauthorizedException("You are not authorized to delete this comment");
        }

        this.comments = this.comments.filter((c) => c.id !== commentId);
    }
}