import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post, User])],
  providers: [CommentService],
  controllers: [CommentController]
})
export class CommentModule { }

