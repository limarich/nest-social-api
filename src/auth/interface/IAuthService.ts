import { UserLoginDto } from "../dto/user_login.dto";
import { RefreshTokenDto } from "../dto/refresh_token.dto";
import { RefreshTokenResponseDto } from "../dto/refresh_token.reponse.dto";
import { LoginResponseDto } from "../dto/login.reponse.dto";

export interface IAuthService {
    login(dto: UserLoginDto): Promise<LoginResponseDto>;
    refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto>;
}