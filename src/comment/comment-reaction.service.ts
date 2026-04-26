import { Injectable, NotFoundException } from "@nestjs/common";
import { ICommentReactionService } from "./interface/comment-reaction.service.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommentReaction } from "./entity/comment-reaction.entity";
import { Comment } from "./entity/comment.entity";
import { ReactionType } from "src/post/entity/post-reaction.entity";
import { UserService } from "src/user/user.service";

@Injectable()
export class CommentReactionService implements ICommentReactionService {
    constructor(
        @InjectRepository(CommentReaction)
        private readonly commentReactionRepository: Repository<CommentReaction>,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        private readonly userService: UserService,
    ) { }

    private async getReaction(commentId: string, userId: string): Promise<CommentReaction | null> {
        return this.commentReactionRepository.findOne({ where: { commentId, userId } });
    }

    private async updateReaction(type: ReactionType, existing: CommentReaction): Promise<void> {
        if (existing.type === type) {
            await this.commentReactionRepository.delete(existing.id);
            const field = type === ReactionType.LIKE ? 'likes' : 'unlikes';
            await this.commentRepository.decrement({ id: existing.commentId }, field, 1);
            return;
        }

        await this.commentReactionRepository.update(existing.id, { type });

        if (type === ReactionType.LIKE) {
            await this.commentRepository.increment({ id: existing.commentId }, 'likes', 1);
            await this.commentRepository.decrement({ id: existing.commentId }, 'unlikes', 1);
        } else {
            await this.commentRepository.increment({ id: existing.commentId }, 'unlikes', 1);
            await this.commentRepository.decrement({ id: existing.commentId }, 'likes', 1);
        }
    }

    async react(commentId: string, userId: string, type: ReactionType): Promise<void> {
        await this.userService.findOne(userId);

        const comment = await this.commentRepository.findOneBy({ id: commentId });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const existing = await this.getReaction(commentId, userId);

        if (existing) {
            await this.updateReaction(type, existing);
            return;
        }

        const reaction = this.commentReactionRepository.create({ commentId, type, userId });
        await this.commentReactionRepository.save(reaction);

        const field = type === ReactionType.LIKE ? 'likes' : 'unlikes';
        await this.commentRepository.increment({ id: commentId }, field, 1);
    }
}
