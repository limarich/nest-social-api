import { UserStatsResponseDto } from "../dto/user-stats.response.dto";

export abstract class IUserStatsService {
    abstract findStats(userId: string): Promise<UserStatsResponseDto>;
}