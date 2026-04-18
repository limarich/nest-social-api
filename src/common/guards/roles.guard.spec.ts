import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../roles.enum';
import { ROLES_KEY } from '../contants';
import { TokenPayloadDto } from '../dto/token_payload.dto';

const mockPayload = (role: string): TokenPayloadDto => ({
    sub: 'user-id',
    email: 'user@test.com',
    iat: 0,
    exp: 0,
    aud: 'audience',
    iss: 'issuer',
    role,
});

const createMockContext = (tokenPayload?: TokenPayloadDto): ExecutionContext => ({
    switchToHttp: () => ({ getRequest: () => ({ tokenPayload }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
} as unknown as ExecutionContext);

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: { getAllAndOverride: jest.fn() },
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('rotas sem roles definidas', () => {
        it('deve permitir acesso quando nenhuma role é exigida', () => {
            reflector.getAllAndOverride.mockReturnValue(undefined);
            const context = createMockContext();

            expect(guard.canActivate(context)).toBe(true);
        });
    });

    describe('rotas com roles definidas', () => {
        it('deve permitir acesso quando o usuário tem a role exigida', () => {
            reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
            const context = createMockContext(mockPayload(UserRole.ADMIN));

            expect(guard.canActivate(context)).toBe(true);
        });

        it('deve negar acesso quando o usuário não tem a role exigida', () => {
            reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
            const context = createMockContext(mockPayload(UserRole.USER));

            expect(guard.canActivate(context)).toBe(false);
        });

        it('deve permitir acesso quando o usuário tem pelo menos uma das roles exigidas', () => {
            reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.USER]);
            const context = createMockContext(mockPayload(UserRole.USER));

            expect(guard.canActivate(context)).toBe(true);
        });

        it('deve negar acesso quando o tokenPayload está ausente', () => {
            reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
            const context = createMockContext(undefined);

            expect(guard.canActivate(context)).toBe(false);
        });
    });

    describe('reflector', () => {
        it('deve consultar o metadata nos handlers corretos', () => {
            reflector.getAllAndOverride.mockReturnValue(undefined);
            const context = createMockContext();
            const handler = context.getHandler();
            const cls = context.getClass();

            guard.canActivate(context);

            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [handler, cls]);
        });
    });
});
