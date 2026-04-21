import { IsEnum, IsNotEmpty } from "class-validator";
import { ReactionType } from "../entity/post-reaction.entity";

export class PostReactionDto {
    @IsNotEmpty()
    @IsEnum(ReactionType)
    type: ReactionType;
}