import { Injectable, NotFoundException } from "@nestjs/common";
import { IPostReactionService } from "./interface/post-reaction.service.interface";
import { Repository } from "typeorm";
import { PostReaction, ReactionType } from "./entity/post-reaction.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "src/user/user.service";
import { Post } from "./entity/post.entity";

@Injectable()
export class PostReactionService implements IPostReactionService {
    constructor(
        @InjectRepository(PostReaction)
        private readonly postReactionRepository: Repository<PostReaction>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly userService: UserService,
    ) { }

    async getReaction(postId: string, userId: string): Promise<PostReaction | null> {
        return await this.postReactionRepository.findOne({
            where: { postId, userId }
        });
    }

    async updateReaction(type: ReactionType, existingReaction: PostReaction): Promise<void> {

        // if same reaction, remove it
        if (existingReaction.type === type) {
            await this.postReactionRepository.delete(existingReaction.id);

            const field = type === ReactionType.LIKE ? 'likes' : 'unlikes';
            await this.postRepository.decrement({ id: existingReaction.postId }, field, 1);
            return;
        }

        // if different reaction, update it
        await this.postReactionRepository.update(existingReaction.id, { type });

        if (type === ReactionType.LIKE) {
            // increment like and decrement unlike
            await this.postRepository.increment({ id: existingReaction.postId }, 'likes', 1);
            await this.postRepository.decrement({ id: existingReaction.postId }, 'unlikes', 1);
        } else {
            // increment unlike and decrement like
            await this.postRepository.increment({ id: existingReaction.postId }, 'unlikes', 1);
            await this.postRepository.decrement({ id: existingReaction.postId }, 'likes', 1);
        }
    }


    async react(postId: string, userId: string, type: ReactionType): Promise<void> {
        await this.userService.findOne(userId);

        const post = await this.postRepository.findOne({
            where: { id: postId }
        });

        if (!post) {
            throw new NotFoundException(`Post not found`);
        }

        const existingReaction = await this.getReaction(postId, userId);

        if (existingReaction) {
            await this.updateReaction(type, existingReaction);
            return;
        }

        const reaction = this.postReactionRepository.create({ postId, type, userId });
        await this.postReactionRepository.save(reaction);

        const field = type === ReactionType.LIKE ? 'likes' : 'unlikes';
        await this.postRepository.increment({ id: postId }, field, 1);

        return;
    }
}