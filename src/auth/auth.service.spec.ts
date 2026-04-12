import { Test, TestingModule } from '@nestjs/testing';
import { EMAIL_ADDRESS } from 'src/user/user.service.mock';
import { BadRequestException } from '@nestjs/common';
import { AuthServiceMock } from './auth.service.mock';

describe('AuthService', () => {
  let service: AuthServiceMock;;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthServiceMock],
    }).compile();

    service = module.get<AuthServiceMock>(AuthServiceMock);
    await service.init(); // Initialize the mock database
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login a user', async () => {
    const user = await service.login({ email: EMAIL_ADDRESS, password: 'password' });
    expect(user).toBeDefined();
  })

  it('should not login a user', async () => {
    await expect(service.login({ email: EMAIL_ADDRESS, password: 'wrong-password' })).rejects.toThrow(BadRequestException);
  })

  it('should not login a user', async () => {
    await expect(service.login({ email: 'invalid-email', password: 'password' })).rejects.toThrow(BadRequestException);
  })
});
