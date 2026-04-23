import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceMock } from 'src/user/user.service.mock';
import { PostServiceMock } from './post.service.mock';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('PostService', () => {
  let postService: PostServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostServiceMock, UserServiceMock],
    }).compile();

    const userService = module.get<UserServiceMock>(UserServiceMock);
    await userService.init();

    postService = module.get<PostServiceMock>(PostServiceMock);
    await postService.init();
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
  });

  it('should create a new post', async () => {
    const post = await postService.create({
      title: 'New Post',
      content: 'New Content',
    }, 'abc-123');

    expect(post.title).toBe('New Post');
    expect(post.content).toBe('New Content');
    expect(post.author).toBe('Richard');
    expect(post.id).toBeDefined();
  });

  it('should throw NotFoundException when creating post for unknown user', async () => {
    await expect(
      postService.create({ title: 'T', content: 'C' }, 'unknown-id'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find a post by id', async () => {
    const post = await postService.findOne('abc-123');
    expect(post.id).toBe('abc-123');
    expect(post.title).toBeDefined();
    expect(post.author).toBeDefined();
  });

  it('should throw NotFoundException when post is not found', async () => {
    await expect(postService.findOne('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should find all posts', async () => {
    const posts = await postService.findAll({ page: 1, limit: 10 }, 'abc-123');
    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe('abc-123');
  });

  it('should return empty array for out-of-range page', async () => {
    const posts = await postService.findAll({ page: 99, limit: 10 }, 'abc-123');
    expect(posts).toHaveLength(0);
  });

  it('should update a post', async () => {
    const post = await postService.update('abc-123', {
      id: 'abc-123',
      title: 'Updated Title',
      content: 'Updated Content',
    });

    expect(post.title).toBe('Updated Title');
    expect(post.content).toBe('Updated Content');
  });

  it('should throw UnauthorizedException when updating another user post', async () => {
    await expect(
      postService.update('other-user', { id: 'abc-123', title: 'X', content: 'Y' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should remove a post', async () => {
    await postService.remove('abc-123', 'abc-123');
    await expect(postService.findOne('abc-123')).rejects.toThrow(NotFoundException);
  });

  it('should throw UnauthorizedException when removing another user post', async () => {
    await expect(postService.remove('abc-123', 'other-user')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw NotFoundException when removing nonexistent post', async () => {
    await expect(postService.remove('nonexistent', 'abc-123')).rejects.toThrow(NotFoundException);
  });

  it('should find user posts', async () => {
    const userPosts = await postService.findUserPosts('abc-123');
    expect(userPosts).toHaveLength(1);
  })

  it('should find current user posts', async () => {
    const userPosts = await postService.findCurrentUserPosts('abc-123');
    expect(userPosts).toHaveLength(1);
  })
});
