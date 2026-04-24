import { ReactionType } from "../entity/post-reaction.entity";

export class PostResponseDto {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly created_at: Date;
    readonly updated_at: Date;
    readonly author: string;
    readonly user_reaction: ReactionType | null;
    readonly likes: number;
    readonly unlikes: number;
    readonly comment_count: number;
}