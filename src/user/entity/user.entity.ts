import { PrimaryGeneratedColumn, Unique, Column, Entity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { UserRole } from "src/common/roles.enum";

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
}