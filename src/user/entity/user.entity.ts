import { PrimaryGeneratedColumn, Unique, Column, Entity, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Exclude } from "class-transformer";
import { UserRole } from "src/common/enum/roles.enum";
import { Post } from "src/post/entity/post.entity";
import { PostReaction } from "src/post/entity/post-reaction.entity";
import { Comment } from "src/comment/entity/comment.entity";
import { CommentReaction } from "src/comment/entity/comment-reaction.entity";

@Entity()
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Column()
    readonly name: string;

    @Column()
    readonly email: string;

    @Column({ name: 'hashed_password' })
    @Exclude()
    readonly hashedPassword: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    })
    readonly role: UserRole;

    @CreateDateColumn()
    readonly createdAt?: Date;

    @UpdateDateColumn()
    readonly updatedAt?: Date;

    @Column({ name: 'hashed_refresh_token', nullable: true })
    @Exclude()
    readonly hashedRefreshToken?: string;

    @OneToMany(() => Post, (post) => post.author)
    posts: Post[];

    @OneToMany(() => PostReaction, (postReaction) => postReaction.user)
    reactions: PostReaction[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @OneToMany(() => CommentReaction, (reaction) => reaction.user)
    commentReactions: CommentReaction[];
}