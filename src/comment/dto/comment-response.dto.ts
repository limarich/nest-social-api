export class CommentResponseDto {
    id: string;
    content: string;
    postId: string;
    userId: string;
    parentId: string | null;
    repliesCount: number;
    createdAt: Date;
    updatedAt: Date;
}