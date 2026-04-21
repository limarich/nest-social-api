import { Injectable, NotFoundException } from "@nestjs/common";
import { IPostReactionService } from "./interface/post-reaction.service.interface";
import { Repository } from "typeorm";
import { PostReaction, ReactionType } from "./entity/post-reaction.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "src/user/user.service";
import { PostService } from "./post.service";

@Injectable()
export class PostReactionService implements IPostReactionService {
    constructor(
        @InjectRepository(PostReaction)
        private readonly postReactionRepository: Repository<PostReaction>,
        private readonly userService: UserService,
        private readonly postService: PostService
    ) { }

    async react(postId: string, userId: string, type: ReactionType): Promise<void> {
        await this.userService.findOne(userId);
        await this.postService.findOne(postId);

        const existingReaction = await this.postReactionRepository.findOne({
            where: { postId, userId }
        });

        if (existingReaction) {
            if (existingReaction.type === type) {
                await this.unreact(postId, userId);
                return;
            }
            existingReaction.type = type;
            await this.postReactionRepository.save(existingReaction);
            return;
        }

        const reaction = this.postReactionRepository.create({ postId, type, userId });
        await this.postReactionRepository.save(reaction);
    }

    async unreact(postId: string, userId: string): Promise<void> {
        await this.userService.findOne(userId);
        await this.postService.findOne(postId);

        const existingReaction = await this.postReactionRepository.findOne({
            where: { postId, userId }
        });

        if (!existingReaction) {
            throw new NotFoundException(`Reaction not found`);
        }

        await this.postReactionRepository.remove(existingReaction);
    }
}