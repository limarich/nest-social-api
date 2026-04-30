import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';
import { CommentReaction } from './entity/comment-reaction.entity';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';

const mockUser = { id: 'user-1', name: 'Richard' } as User;
const mockPost = { id: 'post-1', title: 'Test Post' } as Post;

const mockComment = {
    id: 'comment-1',
    content: 'Hello world',
    postId: 'post-1',
    userId: 'user-1',
    parentId: null,
    user: mockUser,
} as Comment;

describe('CommentService', () => {
    let service: CommentService;
    let commentRepository: jest.Mocked<Repository<Comment>>;
    let commentReactionRepository: jest.Mocked<Repository<CommentReaction>>;
    let postRepository: jest.Mocked<Repository<Post>>;
    let userRepository: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                CommentService,
                {
                    provide: getRepositoryToken(Comment),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOneBy: jest.fn(),
                        find: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(CommentReaction),
                    useValue: {
                        findBy: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Post),
                    useValue: {
                        findOneBy: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOneBy: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = moduleRef.get(CommentService);
        commentRepository = moduleRef.get(getRepositoryToken(Comment));
        commentReactionRepository = moduleRef.get(getRepositoryToken(CommentReaction));
        postRepository = moduleRef.get(getRepositoryToken(Post));
        userRepository = moduleRef.get(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createComment', () => {
        it('should create and save a comment, returning it with user_reaction null', async () => {
            postRepository.findOneBy.mockResolvedValue(mockPost);
            userRepository.findOneBy.mockResolvedValue(mockUser);
            commentRepository.create.mockReturnValue(mockComment);
            commentRepository.save.mockResolvedValue(mockComment);

            const result = await service.createComment({ postId: 'post-1', content: 'Hello world' }, 'user-1');

            expect(commentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ content: 'Hello world' }),
            );
            expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
            expect(result.content).toBe('Hello world');
            expect(result.user_reaction).toBeNull();
        });

        it('should throw NotFoundException when post does not exist', async () => {
            postRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.createComment({ postId: 'nonexistent', content: 'Hello' }, 'user-1'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            postRepository.findOneBy.mockResolvedValue(mockPost);
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.createComment({ postId: 'post-1', content: 'Hello' }, 'nonexistent'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should look up post and user with correct ids', async () => {
            postRepository.findOneBy.mockResolvedValue(mockPost);
            userRepository.findOneBy.mockResolvedValue(mockUser);
            commentRepository.create.mockReturnValue(mockComment);
            commentRepository.save.mockResolvedValue(mockComment);

            await service.createComment({ postId: 'post-1', content: 'Hi' }, 'user-1');

            expect(postRepository.findOneBy).toHaveBeenCalledWith({ id: 'post-1' });
            expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
        });
    });

    describe('createReply', () => {
        it('should create and save a reply with the parent comment id', async () => {
            commentRepository.findOneBy.mockResolvedValue(mockComment);
            userRepository.findOneBy.mockResolvedValue(mockUser);
            const mockReply = { ...mockComment, id: 'reply-1', parentId: 'comment-1' };
            commentRepository.create.mockReturnValue(mockReply);
            commentRepository.save.mockResolvedValue(mockReply);

            const result = await service.createReply({ parentId: 'comment-1', content: 'I agree!' }, 'user-1');

            expect(commentRepository.save).toHaveBeenCalled();
            expect(result.parentId).toBe('comment-1');
            expect(result.user_reaction).toBeNull();
        });

        it('should throw NotFoundException when parent comment does not exist', async () => {
            commentRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.createReply({ parentId: 'nonexistent', content: 'reply' }, 'user-1'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            commentRepository.findOneBy.mockResolvedValue(mockComment);
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.createReply({ parentId: 'comment-1', content: 'reply' }, 'nonexistent'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getComments', () => {
        it('should return comments with user_reaction from reaction map', async () => {
            commentRepository.find.mockResolvedValue([mockComment]);
            commentReactionRepository.findBy.mockResolvedValue([]);

            const result = await service.getComments('post-1', {}, 'user-1');

            expect(result).toHaveLength(1);
            expect(result[0].user_reaction).toBeNull();
        });

        it('should query only top-level comments (parentId is null)', async () => {
            commentRepository.find.mockResolvedValue([]);
            commentReactionRepository.findBy.mockResolvedValue([]);

            await service.getComments('post-1', {}, 'user-1');

            expect(commentRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ postId: 'post-1' }),
                }),
            );
        });

        it('should apply pagination skip and take', async () => {
            commentRepository.find.mockResolvedValue([]);
            commentReactionRepository.findBy.mockResolvedValue([]);

            await service.getComments('post-1', { page: 2, limit: 5 }, 'user-1');

            expect(commentRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 5, take: 5 }),
            );
        });

        it('should set user_reaction when user has reacted to a comment', async () => {
            const reactionMap = [{ commentId: 'comment-1', type: 'like', userId: 'user-1' }] as CommentReaction[];
            commentRepository.find.mockResolvedValue([mockComment]);
            commentReactionRepository.findBy.mockResolvedValue(reactionMap);

            const result = await service.getComments('post-1', {}, 'user-1');

            expect(result[0].user_reaction).toBe('like');
        });
    });

    describe('getReplies', () => {
        it('should return replies for a given comment id', async () => {
            const mockReply = { ...mockComment, id: 'reply-1', parentId: 'comment-1' };
            commentRepository.find.mockResolvedValue([mockReply]);
            commentReactionRepository.findBy.mockResolvedValue([]);

            const result = await service.getReplies('comment-1', {}, 'user-1');

            expect(result).toHaveLength(1);
            expect(commentRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({ where: { parentId: 'comment-1' } }),
            );
        });

        it('should return empty array when comment has no replies', async () => {
            commentRepository.find.mockResolvedValue([]);
            commentReactionRepository.findBy.mockResolvedValue([]);

            const result = await service.getReplies('comment-1', {}, 'user-1');

            expect(result).toHaveLength(0);
        });
    });

    describe('updateComment', () => {
        it('should update content and save, returning with user_reaction null', async () => {
            const updated = { ...mockComment, content: 'Updated content' };
            commentRepository.findOneBy.mockResolvedValue({ ...mockComment });
            commentRepository.save.mockResolvedValue(updated);

            const result = await service.updateComment({ commentId: 'comment-1', content: 'Updated content' }, 'user-1');

            expect(commentRepository.save).toHaveBeenCalled();
            expect(result.content).toBe('Updated content');
            expect(result.user_reaction).toBeNull();
        });

        it('should throw NotFoundException when comment does not exist', async () => {
            commentRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.updateComment({ commentId: 'nonexistent', content: 'x' }, 'user-1'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw UnauthorizedException when user is not the author', async () => {
            commentRepository.findOneBy.mockResolvedValue(mockComment);

            await expect(
                service.updateComment({ commentId: 'comment-1', content: 'x' }, 'other-user'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should look up comment by commentId', async () => {
            commentRepository.findOneBy.mockResolvedValue({ ...mockComment });
            commentRepository.save.mockResolvedValue(mockComment);

            await service.updateComment({ commentId: 'comment-1', content: 'x' }, 'user-1');

            expect(commentRepository.findOneBy).toHaveBeenCalledWith({ id: 'comment-1' });
        });
    });

    describe('deleteComment', () => {
        it('should remove the comment entity', async () => {
            commentRepository.findOneBy.mockResolvedValue(mockComment);
            commentRepository.remove.mockResolvedValue(mockComment as Comment);

            await service.deleteComment('comment-1', 'user-1');

            expect(commentRepository.remove).toHaveBeenCalledWith(mockComment);
        });

        it('should throw NotFoundException when comment does not exist', async () => {
            commentRepository.findOneBy.mockResolvedValue(null);

            await expect(service.deleteComment('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw UnauthorizedException when user is not the author', async () => {
            commentRepository.findOneBy.mockResolvedValue(mockComment);

            await expect(service.deleteComment('comment-1', 'other-user')).rejects.toThrow(UnauthorizedException);
        });

        it('should look up comment by the provided commentId', async () => {
            commentRepository.findOneBy.mockResolvedValue(mockComment);
            commentRepository.remove.mockResolvedValue(mockComment as Comment);

            await service.deleteComment('comment-1', 'user-1');

            expect(commentRepository.findOneBy).toHaveBeenCalledWith({ id: 'comment-1' });
        });
    });
});
