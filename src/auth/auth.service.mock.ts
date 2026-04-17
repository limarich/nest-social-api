import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuthService } from './interface/IAuthService';
import { UserServiceMock } from 'src/user/user.service.mock';
import { UserLoginDto } from './dto/user_login.dto';
import * as argon from "argon2";
import { LoginResponseDto } from './dto/login.reponse.dto';

@Injectable()
export class AuthServiceMock extends UserServiceMock implements IAuthService {

    async login(dto: UserLoginDto): Promise<LoginResponseDto> {
        const user = await this.findByEmail(dto.email);
        if (!user) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const isPasswordValid = await argon.verify(user.password, dto.password);

        if (!isPasswordValid) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const { password, ...userResponseDto } = user;
        return { user: userResponseDto, access_token: "token" };
    }
}
