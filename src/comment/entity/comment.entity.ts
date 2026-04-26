import { Post } from "src/post/entity/post.entity";
import { User } from "src/user/entity/user.entity";
import { CommentReaction } from "./comment-reaction.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Index()
    @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @Column({ name: 'post_id' })
    postId: string;

    @Index()
    @ManyToOne(() => User, (user) => user.comments, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_id' })
    parent: Comment | null;

    @OneToMany(() => Comment, (comment) => comment.parent)
    replies: Comment[];

    @Column({ name: 'parent_id', nullable: true, default: null })
    parentId: string | null;

    @Column({ default: 0 })
    repliesCount: number;

    @OneToMany(() => CommentReaction, (reaction) => reaction.comment)
    reactions: CommentReaction[];

    @Column({ default: 0 })
    likes: number;

    @Column({ default: 0 })
    unlikes: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}