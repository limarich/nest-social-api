import { UserLoginDto } from "../dto/user_login.dto";
import { UserResponseDto } from "src/user/dto/user.response.dto";

export interface IAuthService {
    login(dto: UserLoginDto): Promise<{ user: UserResponseDto, access_token: string }>;
}