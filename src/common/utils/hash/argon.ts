import { AbstractHashService } from "src/common/interfaces/hash.interface";
import * as argon from "argon2";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ArgonHashService implements AbstractHashService {
    async hash(plain: string): Promise<string> {
        return argon.hash(plain);
    }
    async verify(hash: string, plain: string): Promise<boolean> {
        return argon.verify(hash, plain);
    }
}