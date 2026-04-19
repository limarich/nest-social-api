import { Pagination } from "src/common/interfaces/paginations.interface";
import { IPostService } from "./interface/post.service.interface";
import { PostCreateDto } from "./dto/post.create.dto";
import { PostResponseDto } from "./dto/post.response.dto";
import { PostUpdateDto } from "./dto/post.update.dto";
import { Post } from "./entity/post.entity";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { User } from "src/user/entity/user.entity";
import { UserServiceMock } from "src/user/user.service.mock";
import { randomUUID } from "crypto";

@Injectable()
export class PostServiceMock implements IPostService {
    constructor(private readonly userService: UserServiceMock) { }
    private posts: Post[] = [];

    public async init() {
        const user = await this.userService.findOne("abc-123");

        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        const newPost: Post = {
            id: "abc-123",
            authorId: "abc-123",
            author: user as User,
            content: "Test Content",
            createdAt: new Date(),
            reactions: [],
            title: "Test Post",
            updatedAt: new Date()
        }

        this.posts.push(newPost);
    }

    async create(post: PostCreateDto, userId: string): Promise<PostResponseDto> {
        const user = await this.userService.findOne(userId);

        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        const newPost: Post = {
            id: randomUUID(),
            authorId: userId,
            author: user as User,
            content: post.content,
            createdAt: new Date(),
            reactions: [],
            title: post.title,
            updatedAt: new Date()
        }

        this.posts.push(newPost);

        return {
            id: newPost.id,
            title: newPost.title,
            content: newPost.content,
            created_at: newPost.createdAt,
            updated_at: newPost.updatedAt,
            author: newPost.author.name,
            reactions: newPost.reactions.map(reaction => reaction.type)
        };
    }

    async findAll(pagination: Pagination = {}): Promise<PostResponseDto[]> {
        const { limit = 10, page = 1 } = pagination;
        const posts = this.posts.slice((page - 1) * limit, page * limit);

        return posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            reactions: post.reactions.map(reaction => reaction.type)
        }));
    }

    async findOne(id: string): Promise<PostResponseDto> {
        const postIndex = this.posts.findIndex(post => post.id === id);

        if (postIndex === -1) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        const post = this.posts[postIndex];

        return {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            reactions: post.reactions.map(reaction => reaction.type)
        };
    }

    async update(post: PostUpdateDto, userId: string): Promise<PostResponseDto> {
        const postIndex = this.posts.findIndex(p => p.id === post.id);

        if (postIndex === -1) {
            throw new NotFoundException(`Post with ID ${post.id} not found`);
        }

        if (this.posts[postIndex].authorId !== userId) {
            throw new UnauthorizedException(`You can't delete another user's post`);
        }

        this.posts[postIndex] = {
            ...this.posts[postIndex],
            ...post
        }

        const updatedPost = this.posts[postIndex];

        return {
            id: updatedPost.id,
            title: updatedPost.title,
            content: updatedPost.content,
            created_at: updatedPost.createdAt,
            updated_at: updatedPost.updatedAt,
            author: updatedPost.author.name,
            reactions: updatedPost.reactions.map(reaction => reaction.type)
        };
    }

    async remove(id: string, userId: string): Promise<void> {
        const postIndex = this.posts.findIndex(post => post.id === id);

        if (postIndex === -1) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        if (this.posts[postIndex].authorId !== userId) {
            throw new UnauthorizedException(`You can't delete another user's post`);
        }

        this.posts.splice(postIndex, 1);
    }

    async findUserPosts(userId: string, pagination: Pagination = {}): Promise<PostResponseDto[]> {
        const { page = 1, limit = 10 } = pagination;
        const userPosts = this.posts.filter(posts => posts.authorId === userId)
            .slice((page - 1) * limit, page * limit);

        return userPosts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            reactions: post.reactions.map(reaction => reaction.type)
        }));
    }

    async findCurrentUserPosts(userId: string, pagination: Pagination = {}): Promise<PostResponseDto[]> {
        const { page = 1, limit = 10 } = pagination;
        const userPosts = this.posts.filter(posts => posts.authorId === userId)
            .slice((page - 1) * limit, page * limit);

        return userPosts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            reactions: post.reactions.map(reaction => reaction.type)
        }));
    }
}
