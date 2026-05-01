import { PartialType } from "@nestjs/mapped-types";
import { UserCreateDto } from "./user.create.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class UserUpdateDto extends PartialType(UserCreateDto) {
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}