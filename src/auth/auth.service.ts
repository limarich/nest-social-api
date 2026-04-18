import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IAuthService } from './interface/IAuthService';
import { UserLoginDto } from './dto/user_login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AbstractHashService } from 'src/common/interfaces/hash.interface';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/common/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { User } from 'src/user/entity/user.entity';
import { LoginResponseDto } from './dto/login.reponse.dto';
import { RefreshTokenResponseDto } from './dto/refresh_token.reponse.dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';

enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
}

@Injectable()
export class AuthService implements IAuthService {
    constructor(@InjectRepository(User) readonly userRepository: Repository<User>,
        readonly hashService: AbstractHashService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtService: JwtService,
    ) { }
    async login(dto: UserLoginDto): Promise<LoginResponseDto> {
        const user = await this.userRepository.findOneBy({ email: dto.email });

        if (!user) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const isPasswordValid = await this.hashService.verify(user.hashed_password, dto.password);

        if (!isPasswordValid) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const [access_token, refresh_token] = await Promise.all([
            this.signToken(user.id, user.email, TokenType.ACCESS),
            this.signToken(user.id, user.email, TokenType.REFRESH),
        ]);
        const { hashed_password, hashed_refresh_token: _oldToken, ...userResponse } = user;

        const hashed_refresh_token = await this.hashService.hash(refresh_token);

        await this.userRepository.update(user.id, { hashed_refresh_token });

        return { user: userResponse, access_token, refresh_token };
    }

    async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        let decodedToken: { sub: string; type: string };
        try {
            decodedToken = await this.jwtService.verifyAsync(dto.refresh_token, {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });
        } catch {
            throw new UnauthorizedException(`Invalid refresh token`);
        }

        if (decodedToken.type !== TokenType.REFRESH) {
            throw new UnauthorizedException(`Invalid refresh token`);
        }

        const user = await this.userRepository.findOneBy({ id: decodedToken.sub });

        if (!user || !user.hashed_refresh_token) {
            throw new UnauthorizedException(`Invalid refresh token`);
        }

        const isRefreshTokenValid = await this.hashService.verify(user.hashed_refresh_token, dto.refresh_token);

        if (!isRefreshTokenValid) {
            throw new UnauthorizedException(`Invalid refresh token`);
        }

        const [access_token, refresh_token] = await Promise.all([
            this.signToken(user.id, user.email, TokenType.ACCESS),
            this.signToken(user.id, user.email, TokenType.REFRESH),
        ]);

        const hashed_refresh_token = await this.hashService.hash(refresh_token);
        await this.userRepository.update(user.id, { hashed_refresh_token });

        return { access_token, refresh_token };
    }



    private async signToken(sub: string, email: string, type: TokenType) {
        return await this.jwtService.signAsync({
            sub,
            email,
            type
        }, {
            expiresIn: type === TokenType.ACCESS ? this.jwtConfiguration.ttl : this.jwtConfiguration.refresh_ttl,
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issuer,
        });
    }
}
