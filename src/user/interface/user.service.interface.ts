import { UserWithoutPassword } from "./user.interface";
import { UserCreateDto } from "../dto/user.create.dto";
import { UserUpdateDto } from "../dto/user.update.dto";

export interface IUserService {
    findAll(): Promise<UserWithoutPassword[]>;
    findOne(id: string): Promise<UserWithoutPassword>;
    create(dto: UserCreateDto): Promise<UserWithoutPassword>;
    update(dto: UserUpdateDto): Promise<UserWithoutPassword>;
    remove(id: string): Promise<void>;
}