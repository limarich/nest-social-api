import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_stats')
export class UserStats {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @OneToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ default: 0 })
    postsCount: number;

    @Column({ default: 0 })
    followersCount: number;

    @Column({ default: 0 })
    followingCount: number;
}