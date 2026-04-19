import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enum/roles.enum";
import { ROLES_KEY } from "../contants";
import { TokenPayloadDto } from "../dto/token_payload.dto";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {

        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (!requiredRoles) {
            return true
        }

        const { tokenPayload } = context.switchToHttp().getRequest();

        return requiredRoles.some(role => (tokenPayload as TokenPayloadDto | undefined)?.role === role);
    }
}