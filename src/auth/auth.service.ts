import { Injectable } from '@nestjs/common';
import { IAuthService } from './interface/IAuthService';
import { UserLoginDto } from './dto/UserLoginDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { User, UserWithoutPassword } from '../user/interface/user.interface';
import { AbstractHashService } from 'src/common/interfaces/hash.interface';

@Injectable()
export class AuthService implements IAuthService {
    constructor(@InjectRepository(User) readonly userRepository: Repository<User>,
        readonly hashService: AbstractHashService
    ) { }
    async login(dto: UserLoginDto): Promise<UserWithoutPassword> {
        const user = await this.userRepository.findOneBy({ email: dto.email });

        if (!user) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const isPasswordValid = await this.hashService.verify(user.password, dto.password);

        if (!isPasswordValid) {
            throw new BadRequestException(`Email or password is not valid, please try again`);
        }

        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }
}
