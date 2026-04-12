import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { EMAIL_ADDRESS, UserService } from './user.service';
import { ConflictException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{
        provide: UserService,
        useValue: {
          create: jest.fn().mockImplementation(() => { throw new ConflictException() }),
          update: jest.fn().mockImplementation(() => { throw new ConflictException() }),
          findAll: jest.fn().mockReturnValue([]),
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

  it('should not create two users with same email', () => {

    expect(() => controller.create({
      name: 'John', email: EMAIL_ADDRESS, password: 'password'
    })).toThrow(ConflictException);
  });

  it('should not update a user with an existing email', () => {
    expect(() => controller.update({
      id: 1, name: 'John', email: 'existing@gmail.com', password: 'password'
    })).toThrow(ConflictException);
  });

});
