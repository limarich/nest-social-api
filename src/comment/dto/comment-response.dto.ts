import { ReactionType } from "src/post/entity/post-reaction.entity";

export class CommentResponseDto {
    id: string;
    content: string;
    postId: string;
    userId: string;
    parentId: string | null;
    repliesCount: number;
    likes: number;
    unlikes: number;
    user_reaction: ReactionType | null;
    createdAt: Date;
    updatedAt: Date;
}