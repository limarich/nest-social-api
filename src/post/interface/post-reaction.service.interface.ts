import { ReactionType } from "../entity/post-reaction.entity";

export interface IPostReactionService {
    react(postId: string, userId: string, type: ReactionType): Promise<void>;
    unreact(postId: string, userId: string): Promise<void>;
}