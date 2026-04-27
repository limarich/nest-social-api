import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { PostStatsSubscriber } from './post-stats.subscriber';
import { Post } from './entity/post.entity';
import { UserStats } from 'src/user/entity/user-stats.entity';

describe('PostStatsSubscriber', () => {
    let subscriber: PostStatsSubscriber;
    let mockManager: { increment: jest.Mock; decrement: jest.Mock };

    beforeEach(async () => {
        mockManager = {
            increment: jest.fn(),
            decrement: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                PostStatsSubscriber,
                {
                    provide: getDataSourceToken(),
                    useValue: { subscribers: [] },
                },
            ],
        }).compile();

        subscriber = moduleRef.get(PostStatsSubscriber);
    });

    it('should be defined', () => {
        expect(subscriber).toBeDefined();
    });

    it('should listen to Post entity', () => {
        expect(subscriber.listenTo()).toBe(Post);
    });

    describe('afterInsert', () => {
        it('should increment postsCount using authorId', async () => {
            const event = {
                entity: { authorId: 'user-1' },
                manager: mockManager,
            } as any;

            await subscriber.afterInsert(event);

            expect(mockManager.increment).toHaveBeenCalledWith(UserStats, { userId: 'user-1' }, 'postsCount', 1);
        });

        it('should fall back to author.id when authorId is not set', async () => {
            const event = {
                entity: { author: { id: 'user-2' } },
                manager: mockManager,
            } as any;

            await subscriber.afterInsert(event);

            expect(mockManager.increment).toHaveBeenCalledWith(UserStats, { userId: 'user-2' }, 'postsCount', 1);
        });

        it('should do nothing when entity is null', async () => {
            await subscriber.afterInsert({ entity: null, manager: mockManager } as any);
            expect(mockManager.increment).not.toHaveBeenCalled();
        });

        it('should do nothing when authorId cannot be resolved', async () => {
            await subscriber.afterInsert({ entity: {}, manager: mockManager } as any);
            expect(mockManager.increment).not.toHaveBeenCalled();
        });
    });

    describe('beforeRemove', () => {
        it('should decrement postsCount using authorId', async () => {
            const event = {
                entity: { authorId: 'user-1' },
                manager: mockManager,
            } as any;

            await subscriber.beforeRemove(event);

            expect(mockManager.decrement).toHaveBeenCalledWith(UserStats, { userId: 'user-1' }, 'postsCount', 1);
        });

        it('should fall back to author.id when authorId is not set', async () => {
            const event = {
                entity: { author: { id: 'user-2' } },
                manager: mockManager,
            } as any;

            await subscriber.beforeRemove(event);

            expect(mockManager.decrement).toHaveBeenCalledWith(UserStats, { userId: 'user-2' }, 'postsCount', 1);
        });

        it('should do nothing when entity is null', async () => {
            await subscriber.beforeRemove({ entity: null, manager: mockManager } as any);
            expect(mockManager.decrement).not.toHaveBeenCalled();
        });

        it('should do nothing when authorId cannot be resolved', async () => {
            await subscriber.beforeRemove({ entity: {}, manager: mockManager } as any);
            expect(mockManager.decrement).not.toHaveBeenCalled();
        });
    });
});
