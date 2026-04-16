import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class Pagination {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    readonly page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Max(50)
    readonly limit?: number;
}