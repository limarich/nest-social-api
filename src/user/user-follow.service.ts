import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserResponseDto } from "./dto/user.response.dto";
import { IUserFollowService } from "./interface/user-follow.service.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { Repository } from "typeorm";
import { UserFollow } from "./entity/user-follow.entity";

@Injectable()
export class UserFollowService implements IUserFollowService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(UserFollow) private readonly userFollowRepository: Repository<UserFollow>,
    ) { }

    async follow(follower_id: string, following_id: string): Promise<void> {
        if (follower_id === following_id) {
            throw new BadRequestException("You cannot follow yourself");
        }

        const targetUser = await this.userRepository.findOne({ where: { id: following_id } });

        if (!targetUser) {
            throw new NotFoundException(`User with ID ${following_id} to follow not found`);
        }

        const alreadyFollowed = await this.userFollowRepository.findOne({
            where: {
                follower_id: follower_id,
                following_id: following_id,
            }
        });

        if (alreadyFollowed) {
            throw new ConflictException(`User ${follower_id} is already following user ${following_id}`);
        }

        await this.userFollowRepository.save({
            follower_id: follower_id,
            following_id: following_id,
        });

        return;
    }

    async unfollow(follower_id: string, following_id: string): Promise<void> {
        const targetUser = await this.userRepository.findOne({ where: { id: following_id } });

        if (!targetUser) {
            throw new NotFoundException(`User with ID ${following_id} to unfollow not found`);
        }

        const followRelationship = await this.userFollowRepository.findOne({
            where: {
                follower_id: follower_id,
                following_id: following_id,
            }
        });

        if (!followRelationship) {
            throw new ConflictException(`User ${follower_id} is not following user ${following_id}`);
        }

        await this.userFollowRepository.remove(followRelationship);

        return;
    }

    async findFollowers(user_id: string): Promise<UserResponseDto[]> {
        const user = await this.userRepository.findOne({ where: { id: user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${user_id} not found`);
        }
        const followRecords = await this.userFollowRepository.find({
            where: { following_id: user_id },
            relations: ['follower']
        });
        return followRecords.map(f => f.follower);
    }

    async findFollowing(user_id: string): Promise<UserResponseDto[]> {
        const user = await this.userRepository.findOne({ where: { id: user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${user_id} not found`);
        }
        const followRecords = await this.userFollowRepository.find({
            where: { follower_id: user_id },
            relations: ['following']
        });
        return followRecords.map(f => f.following);
    }
}