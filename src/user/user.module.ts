import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserServiceMock } from './user.service.mock';
import { UserFollow } from './entity/user-follow.entity';
import { UserFollowService } from './user-follow.service';
import { UserFollowController } from './user-follow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserFollow])],
  providers: [UserService, UserServiceMock, UserFollowService],
  controllers: [UserController, UserFollowController],
  exports: [UserService, UserServiceMock, UserFollowService]
})
export class UserModule { }
