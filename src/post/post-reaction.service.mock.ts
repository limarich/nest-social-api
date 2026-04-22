import { Injectable } from "@nestjs/common";
import { IPostReactionService } from "./interface/post-reaction.service.interface";
import { PostReaction, ReactionType } from "./entity/post-reaction.entity";
import { randomUUID } from "crypto";
import { Post } from "./entity/post.entity";
import { User } from "src/user/entity/user.entity";

@Injectable()
export class PostReactionServiceMock implements IPostReactionService {
    private postReactions: PostReaction[] = [];

    async init() {
        this.postReactions = [{
            id: randomUUID(),
            postId: 'post-123',
            userId: 'user-123',
            type: ReactionType.LIKE,
            createdAt: new Date(),
            post: new Post(),
            user: new User()
        }]
    }

    async react(postId: string, userId: string, type: ReactionType): Promise<void> {
        const reaction = this.postReactions.find(r => r.userId === userId && r.postId === postId);

        if (!reaction) {
            this.postReactions.push({
                id: randomUUID(),
                postId,
                userId,
                type,
                createdAt: new Date(),
                post: new Post(),
                user: new User()
            });
            return;
        }

        if (reaction.type === type) {
            this.postReactions = this.postReactions.filter(r => r.userId !== userId || r.postId !== postId);
            return;
        }

        this.postReactions = this.postReactions.map(r =>
            r.userId === userId && r.postId === postId ? { ...r, type } : r
        );
    }

    findReaction(postId: string, userId: string): PostReaction | undefined {
        return this.postReactions.find(r => r.postId === postId && r.userId === userId);
    }
}
