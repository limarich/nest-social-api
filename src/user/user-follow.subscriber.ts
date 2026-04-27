import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm';
import { UserFollow } from './entity/user-follow.entity';
import { UserStats } from './entity/user-stats.entity';

@Injectable()
@EventSubscriber()
export class UserFollowSubscriber implements EntitySubscriberInterface<UserFollow> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return UserFollow;
    }

    async afterInsert(event: InsertEvent<UserFollow>): Promise<void> {
        const { entity, manager } = event;
        if (!entity) return;
        await Promise.all([
            manager.increment(UserStats, { userId: entity.following_id }, 'followersCount', 1),
            manager.increment(UserStats, { userId: entity.follower_id }, 'followingCount', 1),
        ]);
    }

    async beforeRemove(event: RemoveEvent<UserFollow>): Promise<void> {
        const { entity, manager } = event;
        if (!entity) return;
        await Promise.all([
            manager.decrement(UserStats, { userId: entity.following_id }, 'followersCount', 1),
            manager.decrement(UserStats, { userId: entity.follower_id }, 'followingCount', 1),
        ]);
    }
}
