import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { PostCreateDto } from "./post.create.dto";

export class PostUpdateDto extends PartialType(PostCreateDto) {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly id: string;
}