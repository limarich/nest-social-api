import { UserResponseDto } from "src/user/dto/user.response.dto";

export class LoginResponseDto {
    readonly user: UserResponseDto;
    readonly access_token: string;
    readonly refresh_token: string;
}