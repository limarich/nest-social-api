import { Pagination } from "src/common/interfaces/paginations.interface";

import { PostCreateDto } from "../dto/post.create.dto";
import { PostResponseDto } from "../dto/post.response.dto";
import { PostUpdateDto } from "../dto/post.update.dto";

export abstract class IPostService {
    abstract create(post: PostCreateDto, userId: string): Promise<PostResponseDto>;
    abstract findAll(pagination: Pagination): Promise<PostResponseDto[]>;
    abstract findOne(id: string): Promise<PostResponseDto>;
    abstract update(post: PostUpdateDto, userId: string): Promise<PostResponseDto>;
    abstract remove(id: string, userId: string): Promise<void>;
}