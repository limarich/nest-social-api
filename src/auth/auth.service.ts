import { Injectable } from '@nestjs/common';
import { IAuthService } from './interface/IAuthService';
import { UserLoginDto } from './dto/UserLoginDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon from "argon2";
import { BadRequestException } from '@nestjs/common';
import { User, UserWithoutPassword } from '../user/interface/user.interface';

@Injectable()
export class AuthService implements IAuthService {
    constructor(@InjectRepository(User) readonly userRepository: Repository<User>,
    ) { }
    async login(dto: UserLoginDto): Promise<UserWithoutPassword> {
        const user = await this.userRepository.findOneBy({ email: dto.email });

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
