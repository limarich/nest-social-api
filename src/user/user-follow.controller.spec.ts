import { Test, TestingModule } from '@nestjs/testing';
import { UserFollowController } from './user-follow.controller';
import { UserFollowService } from './user-follow.service';

describe('UserFollowController', () => {
  let controller: UserFollowController;
  let service: UserFollowService;

  const mockUserFollowService = {
    follow: jest.fn(),
    unfollow: jest.fn(),
    findFollowers: jest.fn(),
    findFollowing: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFollowController],
      providers: [
        {
          provide: UserFollowService,
          useValue: mockUserFollowService,
        },
      ],
    }).compile();

    controller = module.get<UserFollowController>(UserFollowController);
    service = module.get<UserFollowService>(UserFollowService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('follow', () => {
    it('should call service.follow', async () => {
      const followerId = 'user-1';
      const followingId = 'user-2';
      mockUserFollowService.follow.mockResolvedValue(undefined);

      await controller.follow(followerId, followingId);

      expect(service.follow).toHaveBeenCalledWith(followerId, followingId);
    });
  });

  describe('unfollow', () => {
    it('should call service.unfollow', async () => {
      const followerId = 'user-1';
      const followingId = 'user-2';
      mockUserFollowService.unfollow.mockResolvedValue(undefined);

      await controller.unfollow(followerId, followingId);

      expect(service.unfollow).toHaveBeenCalledWith(followerId, followingId);
    });
  });

  describe('findFollowers', () => {
    it('should call service.findFollowers', async () => {
      const userId = 'user-1';
      const mockFollowers = [{ id: 'user-2', name: 'Follower' }];
      mockUserFollowService.findFollowers.mockResolvedValue(mockFollowers);

      const result = await controller.findFollowers(userId);

      expect(service.findFollowers).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFollowers);
    });
  });

  describe('findFollowing', () => {
    it('should call service.findFollowing', async () => {
      const userId = 'user-1';
      const mockFollowing = [{ id: 'user-3', name: 'Following' }];
      mockUserFollowService.findFollowing.mockResolvedValue(mockFollowing);

      const result = await controller.findFollowing(userId);

      expect(service.findFollowing).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFollowing);
    });
  });
});
