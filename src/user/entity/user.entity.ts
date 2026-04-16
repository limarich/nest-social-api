import { PrimaryGeneratedColumn, Unique, Column, Entity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Exclude } from "class-transformer";

export enum UserRole {
    ADMIN = "admin",
    USER = "user"
}

@Entity()
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Column()
    readonly name: string;

    @Column()
    readonly email: string;

    @Column()
    @Exclude()
    readonly password: string;

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
}