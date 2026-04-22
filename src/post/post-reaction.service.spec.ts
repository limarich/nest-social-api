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

  it('should not affect other reactions when toggling', async () => {
    await reactionService.react('post-456', 'user-456', ReactionType.LIKE);
    await reactionService.react('post-123', 'user-123', ReactionType.LIKE); // remove existing
    const other = reactionService.findReaction('post-456', 'user-456');
    expect(other).toBeDefined();
  });
});
