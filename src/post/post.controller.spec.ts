import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostResponseDto } from './dto/post.response.dto';

const mockPost: PostResponseDto = {
  id: 'post-uuid',
  title: 'Test Post',
  content: 'Test Content',
  author: 'John Doe',
  reactions: [],
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

describe('PostController', () => {
  let controller: PostController;
  let postService: jest.Mocked<PostService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findUserPosts: jest.fn(),
            findCurrentUserPosts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    postService = module.get(PostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call PostService.create with dto and userId', async () => {
      const dto = { title: 'New Post', content: 'New Content' };
      const userId = 'user-uuid';
      postService.create.mockResolvedValue(mockPost);

      const result = await controller.create(dto, userId);

      expect(postService.create).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      postService.findAll.mockResolvedValue([mockPost]);

      const result = await controller.findAll({});

      expect(postService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findOne', () => {
    it('should call PostService.findOne with the post id', async () => {
      postService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne('post-uuid');

      expect(postService.findOne).toHaveBeenCalledWith('post-uuid');
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should call PostService.update with dto and userId', async () => {
      const dto = { id: 'post-uuid', title: 'Updated', content: 'Updated Content' };
      const userId = 'user-uuid';
      const updatedPost = { ...mockPost, title: 'Updated', content: 'Updated Content' };
      postService.update.mockResolvedValue(updatedPost);

      const result = await controller.update(dto, userId);

      expect(postService.update).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual(updatedPost);
    });
  });

  describe('remove', () => {
    it('should call PostService.remove with id and userId', async () => {
      postService.remove.mockResolvedValue(undefined);

      await controller.remove('post-uuid', 'user-uuid');

      expect(postService.remove).toHaveBeenCalledWith('post-uuid', 'user-uuid');
    });
  });

  describe('user posts', () => {
    it('should call PostService.findUserPosts with id and userId', async () => {
      postService.findUserPosts.mockResolvedValue([mockPost]);

      const result = await controller.findUserPosts('user-uuid', {});

      expect(postService.findUserPosts).toHaveBeenCalledWith('user-uuid');
      expect(result).toEqual([mockPost]);
    })

    it('should return an empty array if user has no posts', async () => {
      postService.findUserPosts.mockResolvedValue([]);

      const result = await controller.findUserPosts('user-uuid', {});

      expect(postService.findUserPosts).toHaveBeenCalledWith('user-uuid');
      expect(result).toEqual([]);
    })

    it('should return posts of logged in user', async () => {
      postService.findCurrentUserPosts.mockResolvedValue([mockPost]);

      const result = await controller.findCurrentUserPosts('user-uuid', {});

      expect(postService.findCurrentUserPosts).toHaveBeenCalledWith('user-uuid');
      expect(result).toEqual([mockPost]);
    })
  });
});
