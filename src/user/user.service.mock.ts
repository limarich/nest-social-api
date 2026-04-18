import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { IUserService } from './interface/user.service.interface';
import * as argon from "argon2";
import { Pagination } from 'src/common/interfaces/paginations.interface';
import { UserResponseDto } from './dto/user.response.dto';
import { UserRole } from 'src/common/roles.enum';

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
            hashed_password: password,
            createdAt: new Date(),
            updatedAt: new Date(),
            role: UserRole.USER,
            hashed_refresh_token: ""
        },
            {
                email: "email2@gmail.com",
                id: 'def-456',
                name: 'John',
                hashed_password: password,
                createdAt: new Date(),
                updatedAt: new Date(),
                role: UserRole.USER,
                hashed_refresh_token: ""
            })

    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = this.users.find(user => user.email === email);
        return user;
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = this.users.find(user => user.id === id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const { hashed_password, hashed_refresh_token, ...userResponse } = user;
        return userResponse;
    }

    async findAll(pagination: Pagination = {}): Promise<UserResponseDto[]> {
        const { page = 1, limit = 10 } = pagination;

        const skip = (page - 1) * limit;
        const take = limit;

        const users = this.users.slice(skip, skip + take);

        return users.map(user => {
            const { hashed_password, hashed_refresh_token, ...userResponse } = user;
            return userResponse;
        })
    }

    async create(user: UserCreateDto): Promise<UserResponseDto> {
        const userAlreadyExists = await this.findByEmail(user.email);

        if (userAlreadyExists) {
            throw new ConflictException(`User with email ${user.email} already exists`);
        }

        const newUser: User = {
            ...user,
            id: "abc-123",
            createdAt: new Date(),
            updatedAt: new Date(),
            role: UserRole.USER,
            hashed_password: ''
        }
        this.users.push(newUser);
        const { hashed_password, hashed_refresh_token, ...userResponse } = newUser;

        return userResponse;
    }

    async update(user: UserUpdateDto, userId: string): Promise<UserResponseDto> {

        const userIndex = this.users.findIndex(existingUser => existingUser.id === user.id);

        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${user.id} not found`);
        }
        if (this.users[userIndex].id !== userId) {
            throw new UnauthorizedException(`You can't update another user`);
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

        const { hashed_password, hashed_refresh_token, ...userResponse } = updatedUser;

        return userResponse;
    }

    async saveRefreshToken(userId: string, token: string): Promise<void> {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) throw new NotFoundException(`User with ID ${userId} not found`);
        this.users[userIndex] = { ...this.users[userIndex], hashed_refresh_token: token };
    }

    async findByRefreshToken(token: string): Promise<User | undefined> {
        return this.users.find(u => u.hashed_refresh_token === token);
    }

    async remove(id: string, userId: string): Promise<void> {
        const userIndex = this.users.findIndex(user => user.id === id);

        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        if (this.users[userIndex].id !== userId) {
            throw new UnauthorizedException(`You can't delete another user`);
        }

        this.users.splice(userIndex, 1);

        return;
    }

}
