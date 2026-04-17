import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_TOKEN_PAYLOAD_KEY } from "../contants";

export const TokenPayload = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload = request[REQUEST_TOKEN_PAYLOAD_KEY];

    return data ? payload?.[data] : payload;
})