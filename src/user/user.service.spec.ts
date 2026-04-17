import { Test, TestingModule } from '@nestjs/testing';
import { EMAIL_ADDRESS, UserServiceMock } from './user.service.mock';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserServiceMock],
    }).compile();

    service = module.get<UserServiceMock>(UserServiceMock);
    await service.init(); // Initialize the mock database
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail(EMAIL_ADDRESS);
    expect(user).toBeDefined();
  });

  it('should not find user by email', async () => {
    expect(await service.findByEmail('invalid-email')).toBeUndefined();
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.create({
      name: 'John', email: "test123@gmail.com", password: 'password'
    });
    expect(user).toBeDefined();
  });

  it('should update a user', async () => {
    const user = await service.update({
      id: 'abc-123', name: 'John', email: EMAIL_ADDRESS, password: 'password'
    }, 'abc-123');
    expect(user).toBeDefined();
  });

  it('should not update a user', async () => {
    await expect(service.update({
      id: 'abc-1234', name: 'John', email: EMAIL_ADDRESS, password: 'password'
    }, 'abc-123')).rejects.toThrow(NotFoundException);
  })

  it('should not update a different user', async () => {
    await expect(service.update({
      id: 'def-456', name: 'John', email: 'email2@gmail.com', password: 'password'
    }, 'abc-123')).rejects.toThrow(UnauthorizedException);
  })

  it('should delete a user', async () => {
    const user = await service.remove('abc-123', 'abc-123');
    expect(user).toBeUndefined();
  });

  it('should not delete a user', async () => {
    await expect(service.remove('abc-1234', 'abc-123')).rejects.toThrow(NotFoundException);
  })

  it('should not delete a different user', async () => {
    await expect(service.remove('abc-123', 'def-456')).rejects.toThrow(UnauthorizedException);
  })

  it('should find a user', async () => {
    const user = await service.findOne('abc-123');
    expect(user).toBeDefined();
  });

  it('should not find a user', async () => {
    await expect(service.findOne('abc-1234')).rejects.toThrow(NotFoundException);
  })

  it('should find all users', async () => {
    const users = await service.findAll();
    expect(users).toBeDefined();
  });

  it('should find all users with pagination', async () => {
    const users = await service.findAll({ page: 1, limit: 10 });
    expect(users).toBeDefined();
  });

});
