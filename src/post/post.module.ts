import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { PostReaction } from './entity/post-reaction.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostReaction]), UserModule],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule { }
