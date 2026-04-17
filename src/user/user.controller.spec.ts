import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { EMAIL_ADDRESS } from './user.service.mock';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{
        provide: UserService,
        useValue: {
          create: jest.fn().mockRejectedValue(new ConflictException()),
          update: jest.fn().mockRejectedValue(new ConflictException()),
          findAll: jest.fn().mockResolvedValue([]),
          findOne: jest.fn(),
          remove: jest.fn(),
        }
      }],
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

});
