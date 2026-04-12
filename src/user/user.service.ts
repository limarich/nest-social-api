import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { IUserService } from "./interface/user.service.interface";
import { UserCreateDto } from "./dto/user.create.dto";
import { UserUpdateDto } from "./dto/user.update.dto";
import { User, UserWithoutPassword } from "./interface/user.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as argon from "argon2";

@Injectable()
export class UserService implements IUserService {
    constructor(@InjectRepository(User) readonly userRepository: Repository<User>) { }

    async findAll(): Promise<UserWithoutPassword[]> {
        const users = await this.userRepository.find({
            select: {
                id: true,
                name: true,
                password: false,
                role: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        return users;
    }
    async findOne(id: string): Promise<UserWithoutPassword> {
        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }
    async create(dto: UserCreateDto): Promise<UserWithoutPassword> {
        try {
            const hash = await argon.hash(dto.password);
            const user = await this.userRepository.save({ ...dto, password: hash });
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(`User with email ${dto.email} already exists`);
            }
            throw error;
        }
    }
    async update(dto: UserUpdateDto): Promise<UserWithoutPassword> {
        try {
            const existingUser = await this.userRepository.findOneBy({ id: dto.id });
            if (!existingUser) {
                throw new NotFoundException(`User with ID ${dto.id} not found`);
            }
            const updatedUser = { ...existingUser, ...dto };

            if (dto.password) {
                const hash = await argon.hash(dto.password);
                updatedUser.password = hash;
            }
            if (dto.email) {
                const userWithEmail = await this.userRepository.findOneBy({ email: dto.email });
                if (userWithEmail && userWithEmail.id !== dto.id) {
                    throw new ConflictException(`User with email ${dto.email} already exists`);
                }
            }
            const user = await this.userRepository.save(updatedUser);
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(`User with email ${dto.email} already exists`);
            }
            throw error;
        }
    }
    async remove(id: string): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

}