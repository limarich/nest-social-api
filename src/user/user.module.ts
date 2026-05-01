import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserFollow } from './entity/user-follow.entity';
import { UserFollowService } from './user-follow.service';
import { UserFollowController } from './user-follow.controller';
import { UserStats } from './entity/user-stats.entity';
import { UserFollowSubscriber } from './user-follow.subscriber';
import { UserStatsService } from './user-stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserFollow, UserStats])],
  providers: [UserService, UserFollowService, UserFollowSubscriber, UserStatsService],
  controllers: [UserController, UserFollowController],
  exports: [UserService, UserFollowService]
})
export class UserModule { }
