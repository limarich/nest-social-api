import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentReactionService } from './comment-reaction.service';
import { CommentController } from './comment.controller';
import { CommentSubscriber } from './comment.subscriber';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { CommentReaction } from './entity/comment-reaction.entity';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentReaction, Post, User]), UserModule],
  providers: [CommentService, CommentReactionService, CommentSubscriber],
  controllers: [CommentController]
})
export class CommentModule { }

