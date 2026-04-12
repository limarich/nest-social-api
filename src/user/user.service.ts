import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';

export interface UserWithoutPassword extends Omit<User, 'password'> { }
export const EMAIL_ADDRESS = "test@gmail.com";

@Injectable()
export class UserService {

    private users: User[] = [{
        email: EMAIL_ADDRESS,
        id: 1,
        name: 'Richard',
        password: 'password'
    }];
    private lastId = 1;

    findByEmail(email: string): User | undefined {
        const user = this.users.find(user => user.email === email);
        return user;
    }

    findOne(id: number): UserWithoutPassword | undefined {
        const user = this.users.find(user => user.id === id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    findAll(): UserWithoutPassword[] {
        return this.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        })
    }

    create(user: UserCreateDto): UserWithoutPassword {
        const userAlreadyExists = this.findByEmail(user.email);

        if (userAlreadyExists) {
            throw new ConflictException(`User with email ${user.email} already exists`);
        }

        const newUser: User = {
            ...user,
            id: this.lastId++
        }
        this.users.push(newUser);
        const { password, ...userWithoutPassword } = newUser;

        return userWithoutPassword;
    }

    update(user: UserUpdateDto): UserWithoutPassword {

        const userIndex = this.users.findIndex(existingUser => existingUser.id === user.id);

        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${user.id} not found`);
        }

        if (user.email) {
            const existingUser = this.findByEmail(user.email);

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

    remove(id: number) {
        const userIndex = this.users.findIndex(user => user.id === id);

        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.users.splice(userIndex, 1);

        return;
    }

}
