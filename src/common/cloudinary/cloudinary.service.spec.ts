import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';

jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        utils: {
            api_sign_request: jest.fn().mockReturnValue('fake-signature'),
        },
    },
}));

const FIXED_TIMESTAMP = 1_000_000;

describe('CloudinaryService', () => {
    let service: CloudinaryService;

    beforeEach(async () => {
        jest.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP * 1000);

        const moduleRef = await Test.createTestingModule({
            providers: [
                CloudinaryService,
                {
                    provide: ConfigService,
                    useValue: {
                        getOrThrow: jest.fn((key: string) => ({
                            'cloudinary.cloud_name': 'my-cloud',
                            'cloudinary.api_key': 'my-api-key',
                            'cloudinary.api_secret': 'my-api-secret',
                        }[key])),
                    },
                },
            ],
        }).compile();

        service = moduleRef.get(CloudinaryService);
    });

    afterEach(() => jest.restoreAllMocks());

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSignedUploadUrl', () => {
        it('should return an object with a url property', () => {
            const result = service.getSignedUploadUrl();
            expect(result).toHaveProperty('url');
        });

        it('should build url pointing to the correct cloudinary endpoint', () => {
            const { url } = service.getSignedUploadUrl();
            expect(url).toContain('https://api.cloudinary.com/v1_1/my-cloud/image/upload');
        });

        it('should include api_key in the url', () => {
            const { url } = service.getSignedUploadUrl();
            expect(url).toContain('api_key=my-api-key');
        });

        it('should include timestamp in the url', () => {
            const { url } = service.getSignedUploadUrl();
            expect(url).toContain(`timestamp=${FIXED_TIMESTAMP}`);
        });

        it('should include signature in the url', () => {
            const { url } = service.getSignedUploadUrl();
            expect(url).toContain('signature=fake-signature');
        });

        it('should include folder in the url when provided', () => {
            const { url } = service.getSignedUploadUrl('avatars');
            expect(url).toContain('folder=avatars');
        });

        it('should not include folder in the url when not provided', () => {
            const { url } = service.getSignedUploadUrl();
            expect(url).not.toContain('folder=');
        });
    });
});
