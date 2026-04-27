import { CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('user_follow')
@Index(['following_id'])
export class UserFollow {
    @PrimaryColumn()
    follower_id: string;

    @PrimaryColumn()
    following_id: string;

    @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'follower_id' })
    follower: User;

    @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'following_id' })
    following: User;

    @CreateDateColumn()
    created_at: Date;
}