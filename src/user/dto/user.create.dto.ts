import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

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
    @IsString()
    @MinLength(4)
    @IsNotEmpty()
    readonly nickname: string;
    @IsString()
    @IsOptional()
    readonly imageUrl?: string;
    @IsString()
    @IsOptional()
    readonly bio?: string;
}