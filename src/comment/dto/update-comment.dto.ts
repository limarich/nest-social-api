import { IsNotEmpty, IsString } from "class-validator";

export class UpdateCommentDto {

    @IsString()
    @IsNotEmpty()
    commentId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

}