import { Pagination } from "src/common/interfaces/paginations.interface";
import { CommentResponseDto } from "../dto/comment-response.dto";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { CreateReplyDto } from "../dto/create-reply.dto";
import { UpdateCommentDto } from "../dto/update-comment.dto";


export abstract class ICommentService {
    abstract createComment(dto: CreateCommentDto, userId: string): Promise<CommentResponseDto>;
    abstract createReply(dto: CreateReplyDto, userId: string): Promise<CommentResponseDto>;
    abstract getComments(postId: string, pagination: Pagination): Promise<CommentResponseDto[]>;
    abstract getReplies(commentId: string, pagination: Pagination): Promise<CommentResponseDto[]>;
    abstract updateComment(dto: UpdateCommentDto, userId: string): Promise<CommentResponseDto>;
    abstract deleteComment(commentId: string, userId: string): Promise<void>;
}