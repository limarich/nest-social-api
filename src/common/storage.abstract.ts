export abstract class StorageService {
    abstract getSignedUploadUrl(folder?: string): { url: string };
}
