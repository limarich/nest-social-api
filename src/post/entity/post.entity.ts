import { User } from "src/user/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostReaction } from "./post-reaction.entity";
import { Comment } from "src/comment/entity/comment.entity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;

    @Column({ name: 'author_id' })
    authorId: string;

    @OneToMany(() => PostReaction, (reaction) => reaction.post)
    reactions: PostReaction[];

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({
        default: 0
    })
    likes: number;

    @Column({
        default: 0
    })
    unlikes: number;

    @Column({
        default: 0
    })
    commentCount: number;
}
