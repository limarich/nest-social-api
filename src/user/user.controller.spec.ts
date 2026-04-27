import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { EMAIL_ADDRESS } from './user.service.mock';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserStatsService } from './user-stats.service';

describe('UserController', () => {
  let controller: UserController;
  let userStatsService: any;

  beforeEach(async () => {
    userStatsService = {
      findStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockRejectedValue(new ConflictException()),
            update: jest.fn().mockRejectedValue(new ConflictException()),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UserStatsService,
          useValue: userStatsService,
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should not create two users with same email', async () => {
    await expect(controller.create({
      name: 'John', email: EMAIL_ADDRESS, password: 'password'
    })).rejects.toThrow(ConflictException);
  });

  it('should not update a user with an existing email', async () => {
    await expect(controller.update({
      id: "abc-123", name: 'John', email: 'existing@gmail.com', password: 'password'
    }, 'abc-123')).rejects.toThrow(ConflictException);
  });

  describe('findStats', () => {
    it('should return stats for a given user id', async () => {
      const stats = { postsCount: 2, followersCount: 5, followingCount: 1 };
      userStatsService.findStats.mockResolvedValue(stats);

      const result = await controller.findStats('user-1');

      expect(result).toEqual(stats);
      expect(userStatsService.findStats).toHaveBeenCalledWith('user-1');
    });

    it('should propagate NotFoundException when user does not exist', async () => {
      userStatsService.findStats.mockRejectedValue(new NotFoundException());

      await expect(controller.findStats('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMyStats', () => {
    it('should return stats for the authenticated user', async () => {
      const stats = { postsCount: 3, followersCount: 7, followingCount: 2 };
      userStatsService.findStats.mockResolvedValue(stats);

      const result = await controller.findMyStats('user-1');

      expect(result).toEqual(stats);
      expect(userStatsService.findStats).toHaveBeenCalledWith('user-1');
    });
  });
});
