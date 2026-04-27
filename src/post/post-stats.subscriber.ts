import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm';
import { Post } from './entity/post.entity';
import { UserStats } from 'src/user/entity/user-stats.entity';

@Injectable()
@EventSubscriber()
export class PostStatsSubscriber implements EntitySubscriberInterface<Post> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Post;
    }

    async afterInsert(event: InsertEvent<Post>): Promise<void> {
        const { entity, manager } = event;
        if (!entity) return;
        const authorId = entity.authorId ?? entity.author?.id;
        if (!authorId) return;
        await manager.increment(UserStats, { userId: authorId }, 'postsCount', 1);
    }

    async beforeRemove(event: RemoveEvent<Post>): Promise<void> {
        const { entity, manager } = event;
        if (!entity) return;
        const authorId = entity.authorId ?? entity.author?.id;
        if (!authorId) return;
        await manager.decrement(UserStats, { userId: authorId }, 'postsCount', 1);
    }
}
