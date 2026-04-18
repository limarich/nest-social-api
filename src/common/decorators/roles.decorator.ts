import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../roles.enum";
import { ROLES_KEY } from "../contants";

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)