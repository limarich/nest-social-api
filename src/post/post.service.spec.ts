import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './entity/post.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';

const mockAuthor = { id: 'user-1', name: 'Richard' };

const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    content: 'Test Content',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockAuthor,
    authorId: 'user-1',
    reactions: [],
    likes: 0,
    unlikes: 0,
    commentCount: 0,
} as unknown as Post;

describe('PostService', () => {
    let service: PostService;
    let postRepository: jest.Mocked<Repository<Post>>;
    let userService: jest.Mocked<UserService>;
    let mockQueryBuilder;

    beforeEach(async () => {
        mockQueryBuilder = {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            leftJoinAndMapOne: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: getRepositoryToken(Post),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        save: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        findEntity: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = moduleRef.get(PostService);
        postRepository = moduleRef.get(getRepositoryToken(Post));
        userService = moduleRef.get(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should call findEntity and save, returning the created post', async () => {
            userService.findEntity.mockResolvedValue(mockAuthor as User);
            postRepository.save.mockResolvedValue(mockPost as Post);

            const result = await service.create({ title: 'Test Post', content: 'Test Content' }, 'user-1');

            expect(userService.findEntity).toHaveBeenCalledWith('user-1');
            expect(postRepository.save).toHaveBeenCalled();
            expect(result.title).toBe('Test Post');
            expect(result.author).toBe('Richard');
        });

        it('should propagate NotFoundException when user does not exist', async () => {
            userService.findEntity.mockRejectedValue(new NotFoundException());

            await expect(
                service.create({ title: 'T', content: 'C' }, 'nonexistent'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return mapped list of posts', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([{ ...mockPost, userReaction: null }]);

            const result = await service.findAll({ page: 1, limit: 10 }, 'user-1');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('post-1');
            expect(result[0].author).toBe('Richard');
        });

        it('should apply pagination to the query builder', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            await service.findAll({ page: 2, limit: 5 }, 'user-1');

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
        });

        it('should pass userId to the userReaction join', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            await service.findAll({}, 'user-1');

            expect(mockQueryBuilder.leftJoinAndMapOne).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.any(String),
                expect.stringContaining('userId'),
                { userId: 'user-1' },
            );
        });
    });

    describe('findOne', () => {
        it('should return post when found', async () => {
            postRepository.findOne.mockResolvedValue(mockPost);

            const result = await service.findOne('post-1');

            expect(result.id).toBe('post-1');
            expect(result.author).toBe('Richard');
            expect(postRepository.findOne).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 'post-1' } }),
            );
        });

        it('should throw NotFoundException when post does not exist', async () => {
            postRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findUserPosts', () => {
        it('should return mapped posts filtered by authorId', async () => {
            postRepository.find.mockResolvedValue([mockPost]);

            const result = await service.findUserPosts('user-1');

            expect(result).toHaveLength(1);
            expect(postRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({ where: { authorId: 'user-1' } }),
            );
        });
    });

    describe('findCurrentUserPosts', () => {
        it('should return mapped posts filtered by authorId', async () => {
            postRepository.find.mockResolvedValue([mockPost]);

            const result = await service.findCurrentUserPosts('user-1');

            expect(result).toHaveLength(1);
            expect(postRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({ where: { authorId: 'user-1' } }),
            );
        });
    });

    describe('update', () => {
        it('should throw NotFoundException when post does not exist', async () => {
            postRepository.findOne.mockResolvedValue(null);

            await expect(
                service.update('user-1', { id: 'nonexistent', title: 'X', content: 'Y' }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw UnauthorizedException when user is not the author', async () => {
            postRepository.findOne.mockResolvedValue(mockPost);

            await expect(
                service.update('other-user', { id: 'post-1', title: 'X', content: 'Y' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should save and return the updated post', async () => {
            const updated = { ...mockPost, title: 'Updated' };
            postRepository.findOne.mockResolvedValue(mockPost);
            postRepository.save.mockResolvedValue(updated);

            const result = await service.update('user-1', { id: 'post-1', title: 'Updated', content: 'C' });

            expect(postRepository.save).toHaveBeenCalled();
            expect(result.title).toBe('Updated');
        });
    });

    describe('remove', () => {
        it('should throw NotFoundException when post does not exist', async () => {
            postRepository.findOne.mockResolvedValue(null);

            await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw UnauthorizedException when user is not the author', async () => {
            postRepository.findOne.mockResolvedValue(mockPost);

            await expect(service.remove('post-1', 'other-user')).rejects.toThrow(UnauthorizedException);
        });

        it('should call remove with the post entity', async () => {
            postRepository.findOne.mockResolvedValue(mockPost);
            postRepository.remove.mockResolvedValue(mockPost);

            await service.remove('post-1', 'user-1');

            expect(postRepository.remove).toHaveBeenCalledWith(mockPost);
        });
    });
});
