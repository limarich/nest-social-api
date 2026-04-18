import { registerAs } from "@nestjs/config";

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    ttl: Number(process.env.JWT_TTL ?? 3600),
    refresh_ttl: Number(process.env.JWT_REFRESH_TTL ?? 86400),
}))