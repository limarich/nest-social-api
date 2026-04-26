import { Injectable, NotFoundException } from "@nestjs/common";
import { ICommentReactionService } from "./interface/comment-reaction.service.interface";
import { CommentReaction } from "./entity/comment-reaction.entity";
import { ReactionType } from "src/post/entity/post-reaction.entity";
import { Comment } from "./entity/comment.entity";
import { User } from "src/user/entity/user.entity";
import { randomUUID } from "crypto";
import { CommentServiceMock } from "./comment.service.mock";
import { UserServiceMock } from "src/user/user.service.mock";

@Injectable()
export class CommentReactionServiceMock implements ICommentReactionService {
    private reactions: CommentReaction[] = [];

    constructor(
        private readonly commentService: CommentServiceMock,
        private readonly userService: UserServiceMock,
    ) { }

    async react(commentId: string, userId: string, type: ReactionType): Promise<void> {
        await this.userService.findOne(userId);

        const comment = this.commentService.findComment(commentId);
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const existing = this.reactions.find(r => r.commentId === commentId && r.userId === userId);

        if (!existing) {
            this.reactions.push({
                id: randomUUID(),
                commentId,
                userId,
                type,
                createdAt: new Date(),
                comment: new Comment(),
                user: new User(),
            });
            if (type === ReactionType.LIKE) comment.likes += 1;
            else comment.unlikes += 1;
            return;
        }

        if (existing.type === type) {
            this.reactions = this.reactions.filter(r => !(r.commentId === commentId && r.userId === userId));
            if (type === ReactionType.LIKE) comment.likes -= 1;
            else comment.unlikes -= 1;
            return;
        }

        existing.type = type;
        if (type === ReactionType.LIKE) {
            comment.likes += 1;
            comment.unlikes -= 1;
        } else {
            comment.unlikes += 1;
            comment.likes -= 1;
        }
    }

    findReaction(commentId: string, userId: string): CommentReaction | undefined {
        return this.reactions.find(r => r.commentId === commentId && r.userId === userId);
    }
}
