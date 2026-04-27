import { Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { UserFollowService } from "./user-follow.service";
import { TokenPayload } from "src/common/decorators/token_payload.decorator";
import { IsUUID } from "class-validator";

@Controller('user')
export class UserFollowController {
    constructor(
        private readonly userFollowService: UserFollowService,
    ) { }

    @Post('follow/:id')
    async follow(@TokenPayload('sub') follower_id: string, @Param('id', ParseUUIDPipe) following_id: string) {
        return this.userFollowService.follow(follower_id, following_id);
    }

    @Post('unfollow/:id')
    async unfollow(@TokenPayload('sub') follower_id: string, @Param('id', ParseUUIDPipe) following_id: string) {
        return this.userFollowService.unfollow(follower_id, following_id);
    }

    @Get('followers/:id')
    async findFollowers(@Param('id', ParseUUIDPipe) id: string) {
        return this.userFollowService.findFollowers(id);
    }

    @Get('following/:id')
    async findFollowing(@Param('id', ParseUUIDPipe) id: string) {
        return this.userFollowService.findFollowing(id);
    }
}