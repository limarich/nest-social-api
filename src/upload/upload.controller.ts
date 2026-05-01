import { Controller, Get, Query } from '@nestjs/common';
import { StorageService } from 'src/common/storage.abstract';

@Controller('upload')
export class UploadController {
    constructor(private readonly storageService: StorageService) {}

    @Get('sign')
    sign(@Query('folder') folder?: string): { url: string } {
        return this.storageService.getSignedUploadUrl(folder);
    }
}
