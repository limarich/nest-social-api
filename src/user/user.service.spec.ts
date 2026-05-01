import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { UserStats } from './entity/user-stats.entity';
import { AbstractHashService } from 'src/common/interfaces/hash.interface';
import { UserRole } from 'src/common/enum/roles.enum';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

const mockUser: User = {
  id: 'user-1',
  name: 'Richard',
  email: 'test@gmail.com',
  hashedPassword: 'hashed-pw',
  hashedRefreshToken: 'hashed-rt',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
  posts: [],
  reactions: [],
  comments: [],
  commentReactions: [],
  followers: [],
  following: [],
  bio: '',
  nickname: '',
  imageUrl: '',
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let userStatsRepository: jest.Mocked<Repository<UserStats>>;
  let hashService: jest.Mocked<AbstractHashService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserStats),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: AbstractHashService,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(UserService);
    userRepository = moduleRef.get(getRepositoryToken(User));
    userStatsRepository = moduleRef.get(getRepositoryToken(UserStats));
    hashService = moduleRef.get(AbstractHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of users', async () => {
      userRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(userRepository.find).toHaveBeenCalled();
    });

    it('should apply pagination skip and take to repository', async () => {
      userRepository.find.mockResolvedValue([]);

      await service.findAll({ page: 2, limit: 5 });

      expect(userRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return user without sensitive fields when found', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(result).toBeDefined();
      expect((result as User).hashedPassword).toBeUndefined();
      expect((result as User).hashedRefreshToken).toBeUndefined();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should hash password and save user and stats', async () => {
      hashService.hash.mockResolvedValue('hashed-pw');
      userRepository.save.mockResolvedValue({ ...mockUser, id: 'new-user' });
      userStatsRepository.save.mockResolvedValue({} as UserStats);

      await service.create({ name: 'John', email: 'john@test.com', password: 'pass123', nickname: 'john', bio: 'bio', imageUrl: 'image-url' });

      expect(hashService.hash).toHaveBeenCalledWith('pass123');
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ hashedPassword: 'hashed-pw', nickname: 'john', bio: 'bio', imageUrl: 'image-url' }),
      );
      expect(userStatsRepository.save).toHaveBeenCalledWith({ userId: 'new-user' });
    });

    it('should throw ConflictException on duplicate email (pg error 23505)', async () => {
      hashService.hash.mockResolvedValue('hashed-pw');
      userRepository.save.mockRejectedValue({ code: '23505', detail: 'email already exists' });

      await expect(
        service.create({ name: 'John', email: 'dup@test.com', password: 'pass123', nickname: 'john', bio: 'bio', imageUrl: 'image-url' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on duplicate nickname (pg error 23505)', async () => {
      hashService.hash.mockResolvedValue('hashed-pw');
      userRepository.save.mockRejectedValue({ code: '23505', detail: 'nickname already exists' });

      await expect(
        service.create({ name: 'John', email: 'john@test.com', password: 'pass123', nickname: 'john', bio: 'bio', imageUrl: 'image-url' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow unexpected errors', async () => {
      hashService.hash.mockResolvedValue('hashed-pw');
      userRepository.save.mockRejectedValue(new Error('db connection lost'));

      await expect(
        service.create({ name: 'John', email: 'john@test.com', password: 'pass123', nickname: 'john', bio: 'bio', imageUrl: 'image-url' }),
      ).rejects.toThrow('db connection lost');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update({ id: 'nonexistent', name: 'John' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when updating another user', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(
        service.update({ id: 'user-1', name: 'Hacked' }, 'user-2'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should save updated user and return without sensitive fields', async () => {
      const updated = { ...mockUser, name: 'Updated Name' };
      userRepository.findOneBy.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updated);

      const result = await service.update({ id: 'user-1', name: 'Updated Name' }, 'user-1');

      expect(userRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
      expect((result as any).hashedPassword).toBeUndefined();
    });

    it('should hash new password when provided in dto', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      hashService.hash.mockResolvedValue('new-hashed-pw');

      await service.update({ id: 'user-1', password: 'newpass' }, 'user-1');

      expect(hashService.hash).toHaveBeenCalledWith('newpass');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when deleting another user', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.remove('user-1', 'user-2')).rejects.toThrow(UnauthorizedException);
    });

    it('should call delete with the correct id', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove('user-1', 'user-1');

      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });
  });
});
