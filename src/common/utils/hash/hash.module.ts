import { Global, Module } from '@nestjs/common';
import { AbstractHashService } from 'src/common/interfaces/hash.interface';
import { ArgonHashService } from './argon';

@Global()
@Module({
    providers: [{ provide: AbstractHashService, useClass: ArgonHashService }],
    exports: [AbstractHashService],
})
export class HashModule { }
