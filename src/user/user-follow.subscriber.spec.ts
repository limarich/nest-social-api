import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { UserFollowSubscriber } from './user-follow.subscriber';
import { UserFollow } from './entity/user-follow.entity';
import { UserStats } from './entity/user-stats.entity';

describe('UserFollowSubscriber', () => {
    let subscriber: UserFollowSubscriber;
    let mockManager: { increment: jest.Mock; decrement: jest.Mock };

    beforeEach(async () => {
        mockManager = {
            increment: jest.fn(),
            decrement: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                UserFollowSubscriber,
                {
                    provide: getDataSourceToken(),
                    useValue: { subscribers: [] },
                },
            ],
        }).compile();

        subscriber = moduleRef.get(UserFollowSubscriber);
    });

    it('should be defined', () => {
        expect(subscriber).toBeDefined();
    });

    it('should listen to UserFollow entity', () => {
        expect(subscriber.listenTo()).toBe(UserFollow);
    });

    describe('afterInsert', () => {
        it('should increment followersCount for the followed user and followingCount for the follower', async () => {
            const event = {
                entity: { follower_id: 'user-1', following_id: 'user-2' },
                manager: mockManager,
            } as any;

            await subscriber.afterInsert(event);

            expect(mockManager.increment).toHaveBeenCalledWith(UserStats, { userId: 'user-2' }, 'followersCount', 1);
            expect(mockManager.increment).toHaveBeenCalledWith(UserStats, { userId: 'user-1' }, 'followingCount', 1);
        });

        it('should do nothing when entity is null', async () => {
            await subscriber.afterInsert({ entity: null, manager: mockManager } as any);
            expect(mockManager.increment).not.toHaveBeenCalled();
        });
    });

    describe('beforeRemove', () => {
        it('should decrement followersCount for the followed user and followingCount for the follower', async () => {
            const event = {
                entity: { follower_id: 'user-1', following_id: 'user-2' },
                manager: mockManager,
            } as any;

            await subscriber.beforeRemove(event);

            expect(mockManager.decrement).toHaveBeenCalledWith(UserStats, { userId: 'user-2' }, 'followersCount', 1);
            expect(mockManager.decrement).toHaveBeenCalledWith(UserStats, { userId: 'user-1' }, 'followingCount', 1);
        });

        it('should do nothing when entity is null', async () => {
            await subscriber.beforeRemove({ entity: null, manager: mockManager } as any);
            expect(mockManager.decrement).not.toHaveBeenCalled();
        });
    });
});
