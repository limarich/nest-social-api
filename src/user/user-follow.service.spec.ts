import { Test } from "@nestjs/testing";
import { UserFollowService } from "./user-follow.service";
import { IUserFollowService } from "./interface/user-follow.service.interface";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { UserFollow } from "./entity/user-follow.entity";
import { NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { Repository } from "typeorm";

describe('UserFollowService', () => {
    let service: IUserFollowService;
    let userRepository: jest.Mocked<Repository<User>>;
    let userFollowRepository: jest.Mocked<Repository<UserFollow>>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: IUserFollowService,
                    useClass: UserFollowService,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(UserFollow),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                        remove: jest.fn(),
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = moduleRef.get<IUserFollowService>(IUserFollowService);
        userRepository = moduleRef.get(getRepositoryToken(User));
        userFollowRepository = moduleRef.get(getRepositoryToken(UserFollow));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('follow', () => {
        it('should throw BadRequestException if trying to follow self', async () => {
            await expect(service.follow('1', '1')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if target user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);
            await expect(service.follow('1', '2')).rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException if already followed', async () => {
            userRepository.findOne.mockResolvedValue({ id: '2' } as User);
            userFollowRepository.findOne.mockResolvedValue({ follower_id: '1', following_id: '2' } as UserFollow);
            await expect(service.follow('1', '2')).rejects.toThrow(ConflictException);
        });

        it('should follow successfully', async () => {
            userRepository.findOne.mockResolvedValue({ id: '2' } as User);
            userFollowRepository.findOne.mockResolvedValue(null);
            await service.follow('1', '2');
            expect(userFollowRepository.save).toHaveBeenCalled();
        });
    });

    describe('unfollow', () => {
        it('should throw NotFoundException if target user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);
            await expect(service.unfollow('1', '2')).rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException if not followed', async () => {
            userRepository.findOne.mockResolvedValue({ id: '2' } as User);
            userFollowRepository.findOne.mockResolvedValue(null);
            await expect(service.unfollow('1', '2')).rejects.toThrow(ConflictException);
        });

        it('should unfollow successfully', async () => {
            userRepository.findOne.mockResolvedValue({ id: '2' } as User);
            userFollowRepository.findOne.mockResolvedValue({ follower_id: '1', following_id: '2' } as UserFollow);
            await service.unfollow('1', '2');
            expect(userFollowRepository.remove).toHaveBeenCalled();
        });
    });

    describe('findFollowers', () => {
        it('should return followers', async () => {
            userRepository.findOne.mockResolvedValue({ id: '1' } as User);
            userFollowRepository.find.mockResolvedValue([
                { follower: { id: '2', name: 'User 2' } }
            ] as UserFollow[]);
            const result = await service.findFollowers('1');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('2');
            expect(userFollowRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                relations: ['follower']
            }));
        });
    });

    describe('findFollowing', () => {
        it('should return following', async () => {
            userRepository.findOne.mockResolvedValue({ id: '1' } as User);
            userFollowRepository.find.mockResolvedValue([
                { following: { id: '3', name: 'User 3' } }
            ] as UserFollow[]);
            const result = await service.findFollowing('1');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('3');
            expect(userFollowRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                relations: ['following']
            }));
        });
    });
});