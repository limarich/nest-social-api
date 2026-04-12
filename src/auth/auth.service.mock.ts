import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuthService } from './interface/IAuthService';
import { UserServiceMock } from 'src/user/user.service.mock';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserWithoutPassword } from 'src/user/interface/user.interface';
import * as argon from "argon2";

@Injectable()
export class AuthServiceMock extends UserServiceMock implements IAuthService {

    async login(dto: UserLoginDto): Promise<UserWithoutPassword> {
        const user = await this.findByEmail(dto.email);
        if (!user) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const isPasswordValid = await argon.verify(user.password, dto.password);

        if (!isPasswordValid) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
