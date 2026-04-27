import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { PostReaction } from './entity/post-reaction.entity';
import { UserModule } from 'src/user/user.module';
import { PostReactionService } from './post-reaction.service';
import { UserStats } from 'src/user/entity/user-stats.entity';
import { PostStatsSubscriber } from './post-stats.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostReaction, UserStats]), UserModule],
  controllers: [PostController],
  providers: [PostService, PostReactionService, PostStatsSubscriber]
})
export class PostModule { }
