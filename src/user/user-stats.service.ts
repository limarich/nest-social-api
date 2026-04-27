import { Injectable, NotFoundException } from "@nestjs/common";
import { IUserStatsService } from "./interface/user-stats.service.interface";
import { UserStatsResponseDto } from "./dto/user-stats.response.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserStats } from "./entity/user-stats.entity";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity";

@Injectable()
export class UserStatsService implements IUserStatsService {
    constructor(
        @InjectRepository(UserStats) private readonly userStatsRepository: Repository<UserStats>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }

    async findStats(userId: string): Promise<UserStatsResponseDto> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const userStats = await this.userStatsRepository.findOne({ where: { userId } });
        if (!userStats) {
            return {
                postsCount: 0,
                followersCount: 0,
                followingCount: 0,
            }
        }
        return {
            postsCount: userStats.postsCount,
            followersCount: userStats.followersCount,
            followingCount: userStats.followingCount,
        };
    }
}