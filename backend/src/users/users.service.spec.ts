import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
}

const mockConfigService = {
  get: jest.fn(),
}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
        {
          provide: 'ConfigService',
          useValue: mockConfigService,
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

  it('should create a user successfully', async () => {
    const dto = {
      username: 'testuser',
      email: 'testuser@gmail.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
    };

    mockUserRepository.findOne.mockResolvedValue(null);
    mockConfigService.get.mockReturnValue('10');

    mockUserRepository.create.mockReturnValue({
      ...dto,
      password: 'hashedPassword',
    })

    mockUserRepository.save.mockResolvedValue({
      id: 1,
      ...dto,
      password: 'hashedPassword',
    });

    const result = await service.create(dto as any);

    expect(mockUserRepository.findOne).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      ...dto,
      password: 'hashedPassword',
    });
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("should throw a conflict exception if username or email already exists", async () => {
    mockUserRepository.findOne.mockRejectedValue({ id: 1 });

    await expect(service.create({
      username: 'testuser',
      email: 'testuser@gmail.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
    }) as any).rejects.toThrow(ConflictException);
  });
});
