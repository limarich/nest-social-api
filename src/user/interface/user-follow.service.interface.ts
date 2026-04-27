import { UserResponseDto } from "../dto/user.response.dto";

export abstract class IUserFollowService {
    abstract follow(follower_id: string, following_id: string): Promise<void>;

    abstract unfollow(follower_id: string, following_id: string): Promise<void>;

    abstract findFollowers(user_id: string): Promise<UserResponseDto[]>;

    abstract findFollowing(user_id: string): Promise<UserResponseDto[]>;
}