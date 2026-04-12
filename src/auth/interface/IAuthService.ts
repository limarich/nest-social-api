import { UserLoginDto } from "../dto/UserLoginDto";
import { UserWithoutPassword } from "src/user/interface/user.interface";

export interface IAuthService {
    login(dto: UserLoginDto): Promise<UserWithoutPassword>;
}