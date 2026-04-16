import { UserWithoutPassword } from "./user.interface";
import { UserCreateDto } from "../dto/user.create.dto";
import { UserUpdateDto } from "../dto/user.update.dto";
import { Pagination } from "src/common/interfaces/paginations.interface";

export interface IUserService {
    findAll(pagination?: Pagination): Promise<UserWithoutPassword[]>;
    findOne(id: string): Promise<UserWithoutPassword>;
    create(dto: UserCreateDto): Promise<UserWithoutPassword>;
    update(dto: UserUpdateDto): Promise<UserWithoutPassword>;
    remove(id: string): Promise<void>;
}