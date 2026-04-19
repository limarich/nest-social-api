import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserServiceMock } from './user.service.mock';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserServiceMock],
  controllers: [UserController],
  exports: [UserService, UserServiceMock]
})
export class UserModule { }
