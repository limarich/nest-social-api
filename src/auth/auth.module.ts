import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/common/config/jwt.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider())
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, ConfigModule]
})
export class AuthModule { }
