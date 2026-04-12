import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class UserCreateDto {
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    readonly name: string;
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    readonly password: string;
}