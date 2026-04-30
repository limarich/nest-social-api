import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentReactionService } from './comment-reaction.service';
import { CommentReactionDto } from './dto/comment-reaction.dto';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: CommentService;
  let commentReactionService: CommentReactionService;

  const mockCommentService = {
    getComments: jest.fn(),
    getReplies: jest.fn(),
    createComment: jest.fn(),
    createReply: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  };

  const mockCommentReactionService = {
    react: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: CommentReactionService,
          useValue: mockCommentReactionService,
        },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
    commentReactionService = module.get<CommentReactionService>(CommentReactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getComments', () => {
    it('should call commentService.getComments', async () => {
      const postId = 'post-1';
      const userId = 'user-1';
      const pagination = { page: 1, limit: 10 };
      await controller.getComments(postId, pagination, userId);
      expect(commentService.getComments).toHaveBeenCalledWith(postId, pagination, userId);
    });
  });

  describe('getReplies', () => {
    it('should call commentService.getReplies', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const pagination = { page: 1, limit: 10 };
      await controller.getReplies(commentId, pagination, userId);
      expect(commentService.getReplies).toHaveBeenCalledWith(commentId, pagination, userId);
    });
  });

  describe('react', () => {
    it('should call commentReactionService.react', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const dto = { type: 'like' } as CommentReactionDto;
      await controller.react(commentId, userId, dto);
      expect(commentReactionService.react).toHaveBeenCalledWith(commentId, userId, 'like');
    });
  });
});
