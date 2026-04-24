import { IsNotEmpty, IsString } from "class-validator";

export class CreateReplyDto {

    @IsString()
    @IsNotEmpty()
    parentId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

}