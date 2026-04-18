import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, REQUEST_TOKEN_PAYLOAD_KEY } from '../contants';
import jwtConfig from '../config/jwt.config';
import { AuthGuard } from './auth.guard';

const mockJwtConfig = {
    secret: 'test-secret',
    audience: 'test-audience',
    issuer: 'test-issuer',
    ttl: 3600,
};

const mockPayload = { sub: 'user-id', email: 'user@test.com' };

const createMockContext = (token?: string): ExecutionContext => {
    const request: Record<string, any> = {
        headers: { authorization: token ? `Bearer ${token}` : undefined },
    };

    return {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => ({}),
        getClass: () => ({}),
        _request: request,
    } as unknown as ExecutionContext;
};

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let jwtService: jest.Mocked<JwtService>;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                {
                    provide: JwtService,
                    useValue: { verifyAsync: jest.fn() },
                },
                {
                    provide: jwtConfig.KEY,
                    useValue: mockJwtConfig,
                },
                {
                    provide: Reflector,
                    useValue: { getAllAndOverride: jest.fn() },
                },
            ],
        }).compile();

        guard = module.get<AuthGuard>(AuthGuard);
        jwtService = module.get(JwtService);
        reflector = module.get(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('rotas públicas', () => {
        it('deve permitir acesso sem token quando a rota é pública', async () => {
            reflector.getAllAndOverride.mockReturnValue(true);
            const context = createMockContext();

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
            expect(jwtService.verifyAsync).not.toHaveBeenCalled();
        });
    });

    describe('rotas protegidas', () => {
        beforeEach(() => {
            reflector.getAllAndOverride.mockReturnValue(false);
        });

        it('deve lançar UnauthorizedException quando não há token', async () => {
            const context = createMockContext();

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Token not found'),
            );
        });

        it('deve lançar UnauthorizedException quando o token é inválido', async () => {
            jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));
            const context = createMockContext('invalid.token.here');

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Invalid token'),
            );
        });

        it('deve permitir acesso e salvar o payload no request com token válido', async () => {
            jwtService.verifyAsync.mockResolvedValue(mockPayload);
            const context = createMockContext('valid.token.here');
            const request = context.switchToHttp().getRequest();

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
            expect(request[REQUEST_TOKEN_PAYLOAD_KEY]).toEqual(mockPayload);
        });

        it('deve verificar o token com as configurações corretas de jwt', async () => {
            jwtService.verifyAsync.mockResolvedValue(mockPayload);
            const context = createMockContext('valid.token.here');

            await guard.canActivate(context);

            expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.token.here', {
                secret: mockJwtConfig.secret,
                audience: mockJwtConfig.audience,
                issuer: mockJwtConfig.issuer,
            });
        });

        it('deve lançar UnauthorizedException quando o header não segue o formato Bearer', async () => {
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: { authorization: 'Basic dXNlcjpwYXNz' },
                    }),
                }),
                getHandler: () => ({}),
                getClass: () => ({}),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Token not found'),
            );
        });
    });

    describe('reflector', () => {
        it('deve consultar o metadata nos handlers corretos', async () => {
            reflector.getAllAndOverride.mockReturnValue(true);
            const context = createMockContext();
            const handler = context.getHandler();
            const cls = context.getClass();

            await guard.canActivate(context);

            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
                handler,
                cls,
            ]);
        });
    });
});
