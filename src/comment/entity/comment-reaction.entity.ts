import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Comment } from "./comment.entity";
import { User } from "src/user/entity/user.entity";
import { ReactionType } from "src/post/entity/post-reaction.entity";

@Entity()
@Unique(['commentId', 'userId'])
export class CommentReaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Comment, (comment) => comment.reactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'comment_id' })
    comment: Comment;

    @Column({ name: 'comment_id' })
    commentId: string;

    @ManyToOne(() => User, (user) => user.commentReactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'enum', enum: ReactionType })
    type: ReactionType;

    @CreateDateColumn()
    createdAt: Date;
}
