import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuthService } from './interface/IAuthService';
import { UserServiceMock } from 'src/user/user.service.mock';
import { UserLoginDto } from './dto/user_login.dto';
import * as argon from "argon2";
import { LoginResponseDto } from './dto/login.reponse.dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';
import { RefreshTokenResponseDto } from './dto/refresh_token.reponse.dto';

@Injectable()
export class AuthServiceMock extends UserServiceMock implements IAuthService {
    private tokenCounter = 0;
    private generateToken = () => `refresh_token_${++this.tokenCounter}`;

    async login(dto: UserLoginDto): Promise<LoginResponseDto> {
        const user = await this.findByEmail(dto.email);
        if (!user) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const isPasswordValid = await argon.verify(user.hashed_password, dto.password);

        if (!isPasswordValid) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const refresh_token = this.generateToken();
        await this.saveRefreshToken(user.id, refresh_token);

        const { hashed_password, ...userResponseDto } = user;
        return { user: userResponseDto, access_token: "access_token", refresh_token };
    }

    async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        const user = await this.findByRefreshToken(dto.refresh_token);

        if (!user) {
            throw new BadRequestException(`Invalid refresh token`);
        }

        const new_refresh_token = this.generateToken();
        await this.saveRefreshToken(user.id, new_refresh_token);

        return { access_token: "access_token", refresh_token: new_refresh_token };
    }
}
