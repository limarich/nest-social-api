import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserStatsService } from './user-stats.service';
import { IUserStatsService } from './interface/user-stats.service.interface';
import { UserStats } from './entity/user-stats.entity';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';

describe('UserStatsService', () => {
    let service: IUserStatsService;
    let userRepository: jest.Mocked<Repository<User>>;
    let userStatsRepository: jest.Mocked<Repository<UserStats>>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: IUserStatsService,
                    useClass: UserStatsService,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: { findOne: jest.fn() },
                },
                {
                    provide: getRepositoryToken(UserStats),
                    useValue: { findOne: jest.fn() },
                },
            ],
        }).compile();

        service = moduleRef.get(IUserStatsService);
        userRepository = moduleRef.get(getRepositoryToken(User));
        userStatsRepository = moduleRef.get(getRepositoryToken(UserStats));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findStats', () => {
        it('should throw NotFoundException when user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.findStats('user-1')).rejects.toThrow(NotFoundException);
        });

        it('should return zeroed stats when stats record does not exist yet', async () => {
            userRepository.findOne.mockResolvedValue({ id: 'user-1' } as User);
            userStatsRepository.findOne.mockResolvedValue(null);

            const result = await service.findStats('user-1');

            expect(result).toEqual({ postsCount: 0, followersCount: 0, followingCount: 0 });
        });

        it('should return stats DTO when user and stats exist', async () => {
            userRepository.findOne.mockResolvedValue({ id: 'user-1' } as User);
            userStatsRepository.findOne.mockResolvedValue({
                postsCount: 5,
                followersCount: 10,
                followingCount: 3,
            } as UserStats);

            const result = await service.findStats('user-1');

            expect(result).toEqual({ postsCount: 5, followersCount: 10, followingCount: 3 });
        });

        it('should query stats by the provided userId', async () => {
            userRepository.findOne.mockResolvedValue({ id: 'user-1' } as User);
            userStatsRepository.findOne.mockResolvedValue({
                postsCount: 0,
                followersCount: 0,
                followingCount: 0,
            } as UserStats);

            await service.findStats('user-1');

            expect(userStatsRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
        });
    });
});
