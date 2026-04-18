import { Inject, Injectable } from '@nestjs/common';
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

        const isPasswordValid = await this.hashService.verify(user.password, dto.password);

        if (!isPasswordValid) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const [access_token, refresh_token] = await Promise.all([
            this.signToken(user),
            this.signToken(user, this.jwtConfiguration.refresh_ttl),
        ]);
        const { password, ...userResponse } = user;

        return { user: userResponse, access_token, refresh_token };
    }

    async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        try {
            const decodedToken = await this.jwtService.verifyAsync(dto.refresh_token, {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });

            const user = await this.userRepository.findOneBy({ id: decodedToken.sub });

            if (!user) {
                throw new BadRequestException(`User not found`);
            }

            const access_token = await this.signToken(user);
            const refresh_token = await this.signToken(user, this.jwtConfiguration.refresh_ttl);

            return { access_token, refresh_token };
        }
        catch (error) {
            throw new BadRequestException(`Invalid refresh token`);
        }
    }

    private async signToken(user: User, expiresIn?: number) {
        return await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        }, {
            expiresIn: expiresIn ?? this.jwtConfiguration.ttl,
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issuer,
        });
    }
}
