import { UserCreateDto } from "../dto/user.create.dto";
import { UserUpdateDto } from "../dto/user.update.dto";
import { Pagination } from "src/common/interfaces/paginations.interface";
import { UserResponseDto } from "../dto/user.response.dto";

export interface IUserService {
    findAll(pagination?: Pagination): Promise<UserResponseDto[]>;
    findOne(id: string): Promise<UserResponseDto>;
    create(dto: UserCreateDto): Promise<UserResponseDto>;
    update(dto: UserUpdateDto): Promise<UserResponseDto>;
    remove(id: string): Promise<void>;
}