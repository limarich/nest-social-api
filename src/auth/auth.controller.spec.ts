import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EMAIL_ADDRESS } from 'src/user/user.service.mock';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let loginMock: jest.Mock;
  let refreshTokenMock: jest.Mock;

  beforeEach(async () => {
    loginMock = jest.fn();
    refreshTokenMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{
        provide: AuthService,
        useValue: { login: loginMock, refreshToken: refreshTokenMock },
      }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login a user', async () => {
    loginMock.mockResolvedValueOnce({ id: 'abc-123', email: EMAIL_ADDRESS });
    const user = await controller.login({ email: EMAIL_ADDRESS, password: 'password' });
    expect(user).toBeDefined();
  });

  it('should not login a user', async () => {
    loginMock.mockRejectedValueOnce(new BadRequestException('Email or password is not valid, please try again'));
    await expect(controller.login({ email: EMAIL_ADDRESS, password: 'wrong-password' })).rejects.toThrow(BadRequestException);
  });

  it('should refresh a token', async () => {
    refreshTokenMock.mockResolvedValueOnce({ id: 'abc-123', email: EMAIL_ADDRESS });
    const user = await controller.refreshToken({ refresh_token: 'refresh_token' });
    expect(user).toBeDefined();
  });

  it('should not refresh a token', async () => {
    refreshTokenMock.mockRejectedValueOnce(new BadRequestException('Invalid refresh token'));
    await expect(controller.refreshToken({ refresh_token: 'invalid-token' })).rejects.toThrow(BadRequestException);
  });
});
