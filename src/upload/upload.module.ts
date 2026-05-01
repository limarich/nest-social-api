import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UploadController } from './upload.controller';
import { StorageService } from 'src/common/storage.abstract';

@Module({
    imports: [CloudinaryModule],
    controllers: [UploadController],
    providers: [
        {
            provide: StorageService,
            useExisting: CloudinaryService,
        },
    ],
})
export class UploadModule {}
