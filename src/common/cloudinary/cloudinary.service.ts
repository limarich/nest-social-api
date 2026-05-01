import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { StorageService } from 'src/common/storage.abstract';

@Injectable()
export class CloudinaryService extends StorageService {
    private readonly cloudName: string;
    private readonly apiKey: string;
    private readonly apiSecret: string;

    constructor(
        config: ConfigService) {
        super();
        this.cloudName = config.getOrThrow('cloudinary.cloud_name');
        this.apiKey = config.getOrThrow('cloudinary.api_key');
        this.apiSecret = config.getOrThrow('cloudinary.api_secret');

        cloudinary.config({
            cloud_name: this.cloudName,
            api_key: this.apiKey,
            api_secret: this.apiSecret,
        });
    }

    getSignedUploadUrl(folder?: string): { url: string } {
        const timestamp = Math.round(Date.now() / 1000);
        const paramsToSign: Record<string, string | number> = { timestamp };

        if (folder) paramsToSign.folder = folder;

        const signature = cloudinary.utils.api_sign_request(paramsToSign, this.apiSecret);

        const query = new URLSearchParams({
            api_key: this.apiKey,
            timestamp: String(timestamp),
            signature,
            ...(folder && { folder }),
        });

        return { url: `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload?${query}` };
    }
}
