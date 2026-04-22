import { ReactionType } from "../entity/post-reaction.entity";

export interface IPostReactionService {
    react(postId: string, userId: string, type: ReactionType): Promise<void>;
}