import { Test, TestingModule } from '@nestjs/testing';
import { PostReactionServiceMock } from './post-reaction.service.mock';
import { ReactionType } from './entity/post-reaction.entity';

describe('PostReactionService', () => {
  let reactionService: PostReactionServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostReactionServiceMock],
    }).compile();

    reactionService = module.get<PostReactionServiceMock>(PostReactionServiceMock);
    await reactionService.init();
  });

  it('should be defined', () => {
    expect(reactionService).toBeDefined();
  });

  it('should add a reaction when user has not reacted yet', async () => {
    await reactionService.react('post-456', 'user-456', ReactionType.LIKE);
    const reaction = reactionService.findReaction('post-456', 'user-456');
    expect(reaction).toBeDefined();
    expect(reaction!.type).toBe(ReactionType.LIKE);
  });

  it('should remove reaction when user reacts with the same type (toggle)', async () => {
    await reactionService.react('post-123', 'user-123', ReactionType.LIKE);
    const reaction = reactionService.findReaction('post-123', 'user-123');
    expect(reaction).toBeUndefined();
  });

  it('should switch reaction type when user reacts with a different type', async () => {
    await reactionService.react('post-123', 'user-123', ReactionType.UNLIKE);
    const reaction = reactionService.findReaction('post-123', 'user-123');
    expect(reaction).toBeDefined();
    expect(reaction!.type).toBe(ReactionType.UNLIKE);
  });

  it('should remove reaction when unreact is called', async () => {
    await reactionService.unreact('post-123', 'user-123');
    const reaction = reactionService.findReaction('post-123', 'user-123');
    expect(reaction).toBeUndefined();
  });

  it('should not affect other reactions when unreacting', async () => {
    await reactionService.react('post-456', 'user-456', ReactionType.LIKE);
    await reactionService.unreact('post-123', 'user-123');
    const other = reactionService.findReaction('post-456', 'user-456');
    expect(other).toBeDefined();
  });

  it('should do nothing when unreacting a nonexistent reaction', async () => {
    await expect(reactionService.unreact('nonexistent', 'user-123')).resolves.not.toThrow();
  });
});
