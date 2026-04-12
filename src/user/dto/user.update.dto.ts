import { PartialType } from "@nestjs/mapped-types";
import { UserCreateDto } from "./user.create.dto";
import { IsNumber } from "class-validator";

export class UserUpdateDto extends PartialType(UserCreateDto) {
    @IsNumber()
    readonly id: number;
}