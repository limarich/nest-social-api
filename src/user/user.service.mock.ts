import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole, UserWithoutPassword } from './interface/user.interface';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { IUserService } from './interface/user.service.interface';
import * as argon from "argon2";
import { Pagination } from 'src/common/interfaces/paginations.interface';

export const EMAIL_ADDRESS = "test@gmail.com";

@Injectable()
export class UserServiceMock implements IUserService {
    private users: User[] = [];

    public async init() {
        const password = await argon.hash('password');
        this.users.push({
            email: EMAIL_ADDRESS,
            id: 'abc-123',
            name: 'Richard',
            password: password,
            createdAt: new Date(),
            updatedAt: new Date(),
            role: UserRole.USER
        })

    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = this.users.find(user => user.email === email);
        return user;
    }

    async findOne(id: string): Promise<UserWithoutPassword> {
        const user = this.users.find(user => user.id === id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async findAll(pagination: Pagination = {}): Promise<UserWithoutPassword[]> {
        const { page = 1, limit = 10 } = pagination;

        const skip = (page - 1) * limit;
        const take = limit;

        const users = this.users.slice(skip, skip + take);

        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        })
    }

    async create(user: UserCreateDto): Promise<UserWithoutPassword> {
        const userAlreadyExists = await this.findByEmail(user.email);

        if (userAlreadyExists) {
            throw new ConflictException(`User with email ${user.email} already exists`);
        }

        const newUser: User = {
            ...user,
            id: "abc-123",
            createdAt: new Date(),
            updatedAt: new Date(),
            role: UserRole.USER
        }
        this.users.push(newUser);
        const { password, ...userWithoutPassword } = newUser;

        return userWithoutPassword;
    }

    async update(user: UserUpdateDto): Promise<UserWithoutPassword> {

        const userIndex = this.users.findIndex(existingUser => existingUser.id === user.id);

        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${user.id} not found`);
        }

        if (user.email) {
            const existingUser = await this.findByEmail(user.email);

            if (existingUser && existingUser.id !== user.id) {
                throw new ConflictException(`User with email ${user.email} already exists`);
            }

        }

        const updatedUser: User = {
            ...this.users[userIndex],
            ...user,
        }

        this.users[userIndex] = updatedUser;

        const { password, ...userWithoutPassword } = updatedUser;

        return userWithoutPassword;
    }

    async remove(id: string): Promise<void> {
        const userIndex = this.users.findIndex(user => user.id === id);

        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.users.splice(userIndex, 1);

        return;
    }

}
