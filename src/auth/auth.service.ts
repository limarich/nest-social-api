import { Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './interface/IAuthService';
import { UserLoginDto } from './dto/UserLoginDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AbstractHashService } from 'src/common/interfaces/hash.interface';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/common/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { User } from 'src/user/entity/user.entity';
import { LoginResponseDto } from './dto/login.reponse.dto';

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

        const access_token = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        }, {
            expiresIn: this.jwtConfiguration.ttl,
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issuer,
        });
        const { password, ...userResponse } = user;

        return { user: userResponse, access_token };
    }
}
