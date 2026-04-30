import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PostReactionService } from './post-reaction.service';
import { PostReaction, ReactionType } from './entity/post-reaction.entity';
import { Post } from './entity/post.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import { User } from 'src/user/entity/user.entity';

const mockPost = { id: 'post-1', likes: 0, unlikes: 0 } as Post;

const mockReaction = {
    id: 'reaction-1',
    postId: 'post-1',
    userId: 'user-1',
    type: ReactionType.LIKE,
} as PostReaction;

describe('PostReactionService', () => {
    let service: PostReactionService;
    let postReactionRepository: jest.Mocked<Repository<PostReaction>>;
    let postRepository: jest.Mocked<Repository<Post>>;
    let userService: jest.Mocked<UserService>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                PostReactionService,
                {
                    provide: getRepositoryToken(PostReaction),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Post),
                    useValue: {
                        findOne: jest.fn(),
                        increment: jest.fn(),
                        decrement: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = moduleRef.get(PostReactionService);
        postReactionRepository = moduleRef.get(getRepositoryToken(PostReaction));
        postRepository = moduleRef.get(getRepositoryToken(Post));
        userService = moduleRef.get(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('react', () => {
        beforeEach(() => {
            userService.findOne.mockResolvedValue({ id: 'user-1' } as User);
            postRepository.findOne.mockResolvedValue(mockPost);
            postRepository.increment.mockResolvedValue({} as UpdateResult);
            postRepository.decrement.mockResolvedValue({} as UpdateResult);
        });

        it('should throw NotFoundException when post does not exist', async () => {
            postRepository.findOne.mockResolvedValue(null);

            await expect(
                service.react('nonexistent', 'user-1', ReactionType.LIKE),
            ).rejects.toThrow(NotFoundException);
        });

        it('should create and save a new reaction when no prior reaction exists', async () => {
            postReactionRepository.findOne.mockResolvedValue(null);
            postReactionRepository.create.mockReturnValue(mockReaction);
            postReactionRepository.save.mockResolvedValue(mockReaction);

            await service.react('post-1', 'user-1', ReactionType.LIKE);

            expect(postReactionRepository.create).toHaveBeenCalledWith({
                postId: 'post-1',
                type: ReactionType.LIKE,
                userId: 'user-1',
            });
            expect(postReactionRepository.save).toHaveBeenCalledWith(mockReaction);
        });

        it('should increment the correct counter when creating a new like', async () => {
            postReactionRepository.findOne.mockResolvedValue(null);
            postReactionRepository.create.mockReturnValue(mockReaction);
            postReactionRepository.save.mockResolvedValue(mockReaction);

            await service.react('post-1', 'user-1', ReactionType.LIKE);

            expect(postRepository.increment).toHaveBeenCalledWith({ id: 'post-1' }, 'likes', 1);
        });

        it('should increment unlikes when creating a new unlike', async () => {
            postReactionRepository.findOne.mockResolvedValue(null);
            const unlikeReaction = { ...mockReaction, type: ReactionType.UNLIKE };
            postReactionRepository.create.mockReturnValue(unlikeReaction);
            postReactionRepository.save.mockResolvedValue(unlikeReaction);

            await service.react('post-1', 'user-1', ReactionType.UNLIKE);

            expect(postRepository.increment).toHaveBeenCalledWith({ id: 'post-1' }, 'unlikes', 1);
        });

        it('should delete reaction and decrement counter when same type is reacted (toggle)', async () => {
            postReactionRepository.findOne.mockResolvedValue(mockReaction);

            await service.react('post-1', 'user-1', ReactionType.LIKE);

            expect(postReactionRepository.delete).toHaveBeenCalledWith(mockReaction.id);
            expect(postRepository.decrement).toHaveBeenCalledWith({ id: 'post-1' }, 'likes', 1);
        });

        it('should update reaction and swap counters when different type is reacted', async () => {
            postReactionRepository.findOne.mockResolvedValue(mockReaction);

            await service.react('post-1', 'user-1', ReactionType.UNLIKE);

            expect(postReactionRepository.update).toHaveBeenCalledWith(
                mockReaction.id,
                { type: ReactionType.UNLIKE },
            );
            expect(postRepository.increment).toHaveBeenCalledWith({ id: 'post-1' }, 'unlikes', 1);
            expect(postRepository.decrement).toHaveBeenCalledWith({ id: 'post-1' }, 'likes', 1);
        });

        it('should call userService.findOne to validate the user exists', async () => {
            postReactionRepository.findOne.mockResolvedValue(null);
            postReactionRepository.create.mockReturnValue(mockReaction);
            postReactionRepository.save.mockResolvedValue(mockReaction);

            await service.react('post-1', 'user-1', ReactionType.LIKE);

            expect(userService.findOne).toHaveBeenCalledWith('user-1');
        });
    });
});
