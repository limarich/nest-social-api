import { IsEnum, IsNotEmpty } from "class-validator";
import { ReactionType } from "src/post/entity/post-reaction.entity";

export class CommentReactionDto {
    @IsNotEmpty()
    @IsEnum(ReactionType)
    type: ReactionType;
}
