import { Test, TestingModule } from '@nestjs/testing';
import { EMAIL_ADDRESS, UserService } from './user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should find user by email', () => {
    const user = service.findByEmail(EMAIL_ADDRESS);
    expect(user).toBeDefined();
  });

  it('should not find user by email', () => {
    expect(service.findByEmail('invalid-email')).toBeUndefined();
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', () => {
    const user = service.create({
      name: 'John', email: "test123@gmail.com", password: 'password'
    });
    expect(user).toBeDefined();
  });

  it('should update a user', () => {
    const user = service.update({
      id: 1, name: 'John', email: EMAIL_ADDRESS, password: 'password'
    });
    expect(user).toBeDefined();
  });

  it('should not update a user', () => {
    expect(() => service.update({
      id: 2, name: 'John', email: EMAIL_ADDRESS, password: 'password'
    })).toThrow(NotFoundException);
  })

  it('should delete a user', () => {
    const user = service.remove(1);
    expect(user).toBeUndefined();
  });

  it('should not delete a user', () => {
    expect(() => service.remove(2)).toThrow(NotFoundException);
  })

  it('should find a user', () => {
    const user = service.findOne(1);
    expect(user).toBeDefined();
  });

  it('should not find a user', () => {
    expect(() => service.findOne(2)).toThrow(NotFoundException);
  })

  it('should find all users', () => {
    const users = service.findAll();
    expect(users).toBeDefined();
  });


});
