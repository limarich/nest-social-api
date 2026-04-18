import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY, REQUEST_TOKEN_PAYLOAD_KEY } from "../contants";
import jwtConfig from "../config/jwt.config";
import type { ConfigType } from "@nestjs/config";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        const isPublic = this.reflector
            .getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass()
            ]);

        if (isPublic) {
            return true;
        }

        if (!token) {
            throw new UnauthorizedException("Token not found");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token,
                {
                    secret: this.jwtConfiguration.secret,
                    audience: this.jwtConfiguration.audience,
                    issuer: this.jwtConfiguration.issuer,
                }
            );
            if (payload.type !== 'access') {
                throw new UnauthorizedException('Invalid token');
            }

            request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;

            return true;
        } catch (error) {
            throw new UnauthorizedException("Invalid token");
        }

    }

    private extractTokenFromHeader(request: Request): string | undefined {

        const [type, token] = request.headers?.authorization?.split(' ') ?? [];

        if (type !== "Bearer" || !token) {
            return;
        }
        return token;
    }
}