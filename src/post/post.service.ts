import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IPostService } from './interface/post.service.interface';
import { PostCreateDto } from './dto/post.create.dto';
import { PostUpdateDto } from './dto/post.update.dto';
import { Pagination } from 'src/common/interfaces/paginations.interface';
import { PostResponseDto } from './dto/post.response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PostReaction } from './entity/post-reaction.entity';

@Injectable()
export class PostService implements IPostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly userService: UserService
    ) { }

    async create(dto: PostCreateDto, userId: string): Promise<PostResponseDto> {
        const user = await this.userService.findEntity(userId);

        const post = await this.postRepository.save({
            title: dto.title,
            content: dto.content,
            author: user
        });

        return {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            user_reaction: null,
            likes: 0,
            unlikes: 0,
        };
    }
    async findAll(pagination: Pagination = {}, userId: string): Promise<PostResponseDto[]> {
        const { page = 1, limit = 10 } = pagination;

        const posts = await this.postRepository.createQueryBuilder('post')
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndMapOne(
                'post.userReaction',
                'post.reactions',
                'userReaction',
                'userReaction.userId = :userId',
                { userId }
            )
            .skip((page - 1) * limit)
            .take(limit)
            .getMany() as (Post & { userReaction: PostReaction | null })[];

        const postsResponse = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            user_reaction: post.userReaction?.type || null,
            likes: post.likes,
            unlikes: post.unlikes,
        }))

        return postsResponse;
    }
    async findOne(id: string): Promise<PostResponseDto> {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['author', 'reactions']
        })

        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        return {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            user_reaction: null,
            likes: post.likes,
            unlikes: post.unlikes,
        };
    }
    async update(userId: string, dto: PostUpdateDto): Promise<PostResponseDto> {
        const post = await this.postRepository.findOne({
            where: { id: dto.id },
            relations: ['author', 'reactions']
        })

        if (!post) {
            throw new NotFoundException(`Post with ID ${dto.id} not found`);
        }

        if (post.author.id !== userId) {
            throw new UnauthorizedException(`You can't update another user's post`);
        }

        const updatedPost = await this.postRepository.save({
            ...post,
            title: dto.title,
            content: dto.content,
        });

        return {
            id: updatedPost.id,
            title: updatedPost.title,
            content: updatedPost.content,
            created_at: updatedPost.createdAt,
            updated_at: updatedPost.updatedAt,
            author: updatedPost.author.name,
            user_reaction: null,
            likes: updatedPost.likes,
            unlikes: updatedPost.unlikes,
        };
    }
    async remove(id: string, userId: string): Promise<void> {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['author']
        })

        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        if (post.author.id !== userId) {
            throw new UnauthorizedException(`You can't delete another user's post`);
        }

        await this.postRepository.remove(post);
    }

    async findUserPosts(userId: string, pagination: Pagination = {}): Promise<PostResponseDto[]> {
        const { page = 1, limit = 10 } = pagination;
        const userPosts = await this.postRepository.find({
            where: { authorId: userId },
            relations: ['author', 'reactions'],
            skip: (page - 1) * limit,
            take: limit,
        });

        return userPosts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            user_reaction: null,
            likes: post.likes,
            unlikes: post.unlikes,
        }));
    }

    async findCurrentUserPosts(userId: string, pagination: Pagination = {}): Promise<PostResponseDto[]> {
        const { page = 1, limit = 10 } = pagination;
        const userPosts = await this.postRepository.find({
            where: { authorId: userId },
            relations: ['author', 'reactions'],
            skip: (page - 1) * limit,
            take: limit,
        });

        return userPosts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author: post.author.name,
            user_reaction: null,
            likes: post.likes,
            unlikes: post.unlikes,
        }));
    }
}
