import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm';
import { Comment } from './entity/comment.entity';
import { Post } from 'src/post/entity/post.entity';

@Injectable()
@EventSubscriber()
export class CommentSubscriber implements EntitySubscriberInterface<Comment> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Comment;
    }

    async afterInsert(event: InsertEvent<Comment>): Promise<void> {
        const { entity, manager } = event;
        if (entity && !entity.parentId) {
            await manager.increment(Post, { id: entity.postId }, 'commentCount', 1);
        } else if (entity && entity.parentId) {
            await manager.increment(Comment, { id: entity.parentId }, 'repliesCount', 1);
        }
    }

    async beforeRemove(event: RemoveEvent<Comment>): Promise<void> {
        const { entity, manager } = event;
        if (entity && !entity.parentId) {
            await manager.decrement(Post, { id: entity.postId }, 'commentCount', 1);
        } else if (entity && entity.parentId) {
            await manager.decrement(Comment, { id: entity.parentId }, 'repliesCount', 1);
        }
    }
}
