import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommentServiceMock } from './comment.service.mock';
import { UserServiceMock } from 'src/user/user.service.mock';
import { PostServiceMock } from 'src/post/post.service.mock';

describe('CommentService', () => {
  let commentService: CommentServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentServiceMock, UserServiceMock, PostServiceMock],
    }).compile();

    const userService = module.get<UserServiceMock>(UserServiceMock);
    await userService.init();

    const postService = module.get<PostServiceMock>(PostServiceMock);
    await postService.init();

    commentService = module.get<CommentServiceMock>(CommentServiceMock);
    commentService.init();
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const comment = await commentService.createComment({ postId: 'abc-123', content: 'Hello world' }, 'abc-123');

      expect(comment.id).toBeDefined();
      expect(comment.content).toBe('Hello world');
      expect(comment.postId).toBe('abc-123');
      expect(comment.userId).toBe('abc-123');
      expect(comment.parentId).toBeNull();
      expect(comment.repliesCount).toBe(0);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      await expect(
        commentService.createComment({ postId: 'nonexistent-post', content: 'Hello' }, 'abc-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(
        commentService.createComment({ postId: 'abc-123', content: 'Hello' }, 'nonexistent-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createReply', () => {
    it('should create a reply to an existing comment', async () => {
      const reply = await commentService.createReply({ parentId: 'abc-123', content: 'I agree!' }, 'abc-123');

      expect(reply.id).toBeDefined();
      expect(reply.content).toBe('I agree!');
      expect(reply.parentId).toBe('abc-123');
      expect(reply.parent).toBeDefined();
    });

    it('should throw NotFoundException when parent comment does not exist', async () => {
      await expect(
        commentService.createReply({ parentId: 'nonexistent-comment', content: 'reply' }, 'abc-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(
        commentService.createReply({ parentId: 'abc-123', content: 'reply' }, 'nonexistent-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });


  describe('getComments', () => {
    it('should return top-level comments for a post', async () => {
      const comments = await commentService.getComments('abc-123');

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('abc-123');
      expect(comments[0].parentId).toBeNull();
    });

    it('should return empty array when post has no comments', async () => {
      const comments = await commentService.getComments('nonexistent-post');
      expect(comments).toHaveLength(0);
    });

    it('should not include replies in getComments result', async () => {
      await commentService.createReply({ parentId: 'abc-123', content: 'I am a reply' }, 'abc-123');

      const comments = await commentService.getComments('abc-123');
      expect(comments.every(c => c.parentId === null)).toBe(true);
    });
  });


  describe('getReplies', () => {
    it('should return replies of a comment', async () => {
      await commentService.createReply({ parentId: 'abc-123', content: 'I agree!' }, 'abc-123');

      const replies = await commentService.getReplies('abc-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].parentId).toBe('abc-123');
    });

    it('should return empty array when comment has no replies', async () => {
      const replies = await commentService.getReplies('abc-123');
      expect(replies).toHaveLength(0);
    });
  });


  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const updated = await commentService.updateComment({ commentId: 'abc-123', content: 'Updated content' }, 'abc-123');

      expect(updated.content).toBe('Updated content');
      expect(updated.id).toBe('abc-123');
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      await expect(
        commentService.updateComment({ commentId: 'nonexistent', content: 'content' }, 'abc-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when user is not the author', async () => {
      await expect(
        commentService.updateComment({ commentId: 'abc-123', content: 'hacked content' }, 'def-456'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });


  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      await commentService.deleteComment('abc-123', 'abc-123');

      const comments = await commentService.getComments('abc-123');
      expect(comments).toHaveLength(0);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      await expect(
        commentService.deleteComment('nonexistent', 'abc-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when user is not the author', async () => {
      await expect(
        commentService.deleteComment('abc-123', 'def-456'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
