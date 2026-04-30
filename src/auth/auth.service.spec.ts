import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository, UpdateResult } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from 'src/user/entity/user.entity';
import { AbstractHashService } from 'src/common/interfaces/hash.interface';
import { UserRole } from 'src/common/enum/roles.enum';
import jwtConfig from 'src/common/config/jwt.config';

const mockJwtConfig = {
    secret: 'test-secret',
    audience: 'test-audience',
    issuer: 'test-issuer',
    ttl: 3600,
    refresh_ttl: 86400,
};

const mockUser = {
    id: 'user-1',
    name: 'Richard',
    email: 'test@gmail.com',
    hashedPassword: 'hashed-pw',
    hashedRefreshToken: 'hashed-rt',
    role: UserRole.USER,
} as User;

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: jest.Mocked<Repository<User>>;
    let hashService: jest.Mocked<AbstractHashService>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOneBy: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: AbstractHashService,
                    useValue: {
                        hash: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: jwtConfig.KEY,
                    useValue: mockJwtConfig,
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                        verifyAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = moduleRef.get(AuthService);
        userRepository = moduleRef.get(getRepositoryToken(User));
        hashService = moduleRef.get(AbstractHashService);
        jwtService = moduleRef.get(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should throw BadRequestException when email is not found', async () => {
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.login({ email: 'notfound@test.com', password: 'pass' }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when password is incorrect', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser);
            hashService.verify.mockResolvedValue(false);

            await expect(
                service.login({ email: 'test@gmail.com', password: 'wrong-pass' }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should return user, access_token and refresh_token on success', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser);
            hashService.verify.mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
            hashService.hash.mockResolvedValue('hashed-rt');
            userRepository.update.mockResolvedValue({} as UpdateResult);

            const result = await service.login({ email: 'test@gmail.com', password: 'pass' });

            expect(result.access_token).toBe('access-token');
            expect(result.refresh_token).toBe('refresh-token');
            expect(result.user).toBeDefined();
            expect((result.user as User).hashedPassword).toBeUndefined();
        });

        it('should hash the refresh token and persist it', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser);
            hashService.verify.mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
            hashService.hash.mockResolvedValue('hashed-rt');
            userRepository.update.mockResolvedValue({} as UpdateResult);

            await service.login({ email: 'test@gmail.com', password: 'pass' });

            expect(hashService.hash).toHaveBeenCalledWith('refresh-token');
            expect(userRepository.update).toHaveBeenCalledWith(
                mockUser.id,
                { hashedRefreshToken: 'hashed-rt' },
            );
        });

        it('should sign tokens with correct jwt config options', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser);
            hashService.verify.mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValue('token');
            hashService.hash.mockResolvedValue('hashed-rt');
            userRepository.update.mockResolvedValue({} as UpdateResult);

            await service.login({ email: 'test@gmail.com', password: 'pass' });

            expect(jwtService.signAsync).toHaveBeenCalledWith(
                expect.objectContaining({ sub: mockUser.id, type: 'access' }),
                expect.objectContaining({
                    audience: mockJwtConfig.audience,
                    issuer: mockJwtConfig.issuer,
                }),
            );
        });
    });

    describe('refreshToken', () => {
        it('should throw UnauthorizedException when token is invalid (verifyAsync throws)', async () => {
            jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

            await expect(
                service.refreshToken({ refresh_token: 'bad-token' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when token type is not refresh', async () => {
            jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'access' });

            await expect(
                service.refreshToken({ refresh_token: 'access-token' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh' });
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.refreshToken({ refresh_token: 'rt' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when stored refresh token is missing', async () => {
            jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh' });
            userRepository.findOneBy.mockResolvedValue({ ...mockUser, hashedRefreshToken: undefined });

            await expect(
                service.refreshToken({ refresh_token: 'rt' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when refresh token does not match stored hash', async () => {
            jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh' });
            userRepository.findOneBy.mockResolvedValue(mockUser);
            hashService.verify.mockResolvedValue(false);

            await expect(
                service.refreshToken({ refresh_token: 'rt' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should return new access_token and refresh_token on success', async () => {
            jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh' });
            userRepository.findOneBy.mockResolvedValue(mockUser);
            hashService.verify.mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValueOnce('new-access').mockResolvedValueOnce('new-refresh');
            hashService.hash.mockResolvedValue('new-hashed-rt');
            userRepository.update.mockResolvedValue({} as UpdateResult);

            const result = await service.refreshToken({ refresh_token: 'valid-rt' });

            expect(result.access_token).toBe('new-access');
            expect(result.refresh_token).toBe('new-refresh');
        });

        it('should verify the token with correct jwt config options', async () => {
            jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh' });
            userRepository.findOneBy.mockResolvedValue(mockUser);
            hashService.verify.mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValue('token');
            hashService.hash.mockResolvedValue('hashed-rt');
            userRepository.update.mockResolvedValue({} as UpdateResult);

            await service.refreshToken({ refresh_token: 'valid-rt' });

            expect(jwtService.verifyAsync).toHaveBeenCalledWith(
                'valid-rt',
                expect.objectContaining({
                    audience: mockJwtConfig.audience,
                    issuer: mockJwtConfig.issuer,
                }),
            );
        });
    });
});
