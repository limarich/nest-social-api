import { UserRole } from "../entity/user.entity";

export class UserResponseDto {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}