import { UserRole } from "src/common/roles.enum";

export class UserResponseDto {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}