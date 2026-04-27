import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { IUserService } from "./interface/user.service.interface";
import { UserCreateDto } from "./dto/user.create.dto";
import { UserUpdateDto } from "./dto/user.update.dto";
import { UserResponseDto } from "./dto/user.response.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Pagination } from "src/common/interfaces/paginations.interface";
import { AbstractHashService } from "src/common/interfaces/hash.interface";
import { User } from "./entity/user.entity";
import { UserStats } from "./entity/user-stats.entity";

@Injectable()
export class UserService implements IUserService {
    constructor(
        @InjectRepository(User) readonly userRepository: Repository<User>,
        @InjectRepository(UserStats) private readonly userStatsRepository: Repository<UserStats>,
        readonly hashService: AbstractHashService,
    ) { }

    async findAll(pagination: Pagination = {}): Promise<UserResponseDto[]> {
        const { page = 1, limit = 10 } = pagination;
        const users = await this.userRepository.find({
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                name: true,
                hashedPassword: false,
                hashedRefreshToken: false,
                role: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        return users;
    }
    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.findEntity(id);
        const { hashedPassword, hashedRefreshToken, ...userResponse } = user;
        return userResponse;
    }

    async findEntity(id: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }
    async create(dto: UserCreateDto): Promise<UserResponseDto> {
        try {
            const hash = await this.hashService.hash(dto.password);
            const user = await this.userRepository.save({ ...dto, hashedPassword: hash });
            await this.userStatsRepository.save({ userId: user.id });
            const { hashedPassword, hashedRefreshToken, ...userResponse } = user;
            return userResponse;
        }
        catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(`User with email ${dto.email} already exists`);
            }
            throw error;
        }
    }
    async update(dto: UserUpdateDto, userId: string): Promise<UserResponseDto> {
        try {
            const existingUser = await this.userRepository.findOneBy({ id: dto.id });

            if (!existingUser) {
                throw new NotFoundException(`User not found`);
            }
            if (existingUser.id !== userId) {
                throw new UnauthorizedException(`You can't update another user`);
            }
            const updatedUser = { ...existingUser, ...dto };

            if (dto.password) {
                const hash = await this.hashService.hash(dto.password);
                updatedUser.hashedPassword = hash;
            }
            if (dto.email) {
                const userWithEmail = await this.userRepository.findOneBy({ email: dto.email });
                if (userWithEmail && userWithEmail.id !== dto.id) {
                    throw new ConflictException(`User with email ${dto.email} already exists`);
                }
            }
            const user = await this.userRepository.save(updatedUser);
            const { hashedPassword, hashedRefreshToken, ...userResponse } = user;
            return userResponse;
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(`User with email ${dto.email} already exists`);
            }
            throw error;
        }
    }
    async remove(id: string, userId: string): Promise<void> {
        const existingUser = await this.userRepository.findOneBy({ id });

        if (!existingUser) {
            throw new NotFoundException(`User not found`);
        }
        if (existingUser.id !== userId) {
            throw new UnauthorizedException(`You can't delete another user`);
        }
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

}