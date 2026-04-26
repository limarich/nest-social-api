import { ReactionType } from "src/post/entity/post-reaction.entity";

export interface ICommentReactionService {
    react(commentId: string, userId: string, type: ReactionType): Promise<void>;
}
