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
import { CommentResponseDto } from "./dto/comment-response.dto";
import { Pagination } from "src/common/interfaces/paginations.interface";

@Injectable()
export class CommentServiceMock implements ICommentService {
    private comments: Comment[] = [];

    constructor(
        private readonly userService: UserServiceMock,
        private readonly postService: PostServiceMock,
    ) { }

    public findComment(id: string): Comment | undefined {
        return this.comments.find(c => c.id === id);
    }

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
                likes: 0,
                unlikes: 0,
                reactions: [],
            }
        ];
    }

    private async validatePostExists(postId: string): Promise<void> {
        await this.postService.findOne(postId);
    }

    private async validateUserExists(userId: string): Promise<void> {
        await this.userService.findOne(userId);
    }

    async createComment(dto: CreateCommentDto, userId: string): Promise<CommentResponseDto> {
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
            likes: 0,
            unlikes: 0,
            reactions: [],
        };

        this.comments.push(newComment);
        this.postService.modifyCommentCount(dto.postId, 1);
        return { ...newComment, user_reaction: null };
    }

    async createReply(dto: CreateReplyDto, userId: string): Promise<CommentResponseDto> {
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
            likes: 0,
            unlikes: 0,
            reactions: [],
        };

        this.comments.push(newComment);
        parentComment.repliesCount += 1;
        return { ...newComment, user_reaction: null };
    }

    async getComments(postId: string, _pagination: Pagination, _userId: string): Promise<CommentResponseDto[]> {
        return this.comments
            .filter((c) => c.postId === postId && c.parentId === null)
            .map((c) => ({ ...c, user_reaction: null }));
    }

    async getReplies(commentId: string, _pagination: Pagination, _userId: string): Promise<CommentResponseDto[]> {
        return this.comments
            .filter((c) => c.parentId === commentId)
            .map((c) => ({ ...c, user_reaction: null }));
    }

    async updateComment(dto: UpdateCommentDto, userId: string): Promise<CommentResponseDto> {
        const comment = this.comments.find((comment) => comment.id === dto.commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        if (comment.userId !== userId) {
            throw new UnauthorizedException("You are not authorized to update this comment");
        }

        comment.content = dto.content;
        comment.updatedAt = new Date();
        return { ...comment, user_reaction: null };
    }

    async deleteComment(commentId: string, userId: string): Promise<void> {
        const comment = this.comments.find((comment) => comment.id === commentId);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        if (comment.userId !== userId) {
            throw new UnauthorizedException("You are not authorized to delete this comment");
        }

        if (comment.parentId) {
            const parent = this.comments.find(c => c.id === comment.parentId);
            if (parent) parent.repliesCount -= 1;
        } else {
            this.postService.modifyCommentCount(comment.postId, -1);
            this.comments = this.comments.filter(c => c.parentId === comment.id ? false : true);
        }

        this.comments = this.comments.filter((c) => c.id !== commentId);
    }
}