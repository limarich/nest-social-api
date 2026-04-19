import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Post } from "./post.entity";
import { User } from "src/user/entity/user.entity";

export enum ReactionType {
    LIKE = 'like',
    UNLIKE = 'unlike',
}

@Entity()
@Unique(['postId', 'userId'])
export class PostReaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Post, (post) => post.reactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @Column({ name: 'post_id' })
    postId: string;

    @ManyToOne(() => User, (user) => user.reactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'enum', enum: ReactionType })
    type: ReactionType;

    @CreateDateColumn()
    createdAt: Date;
}
