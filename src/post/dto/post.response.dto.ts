export class PostResponseDto {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly created_at: Date;
    readonly updated_at: Date;
    readonly author: string;
    readonly reactions: string[];
}