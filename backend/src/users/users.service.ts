import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, DataSource, Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { ConfigService } from '@nestjs/config';

import { plainToInstance } from 'class-transformer';

import { User } from './entities/user.entity';
import { InternalProfile } from './entities/internal-profile.entity';

import { Role, UserType } from '../common/enum/role.enum';

import { CreateInternalUserDto } from './dto/create/create-internal-user.dto';

import { UpdateInternalUserDto } from './dto/update/update-internal-user.dto';

import { InternalUsersFilterDto } from './dto/filters/internal-users-filter.dto';

import { InternalUserResponseDto } from './dto/response/internal-user-response.dto';
import { InternalUserDetailDto } from './dto/response/internal-user-detail.dto';

import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

import { paginate } from '../common/utils/paginate.helper';

import { UserResponseBuilderService } from '../common/utils/user-response-builder.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,

    private readonly userResponseBuilder: UserResponseBuilderService,
  ) {}

  async createInternalUser(dto: CreateInternalUserDto) {
    const { username, email, password, firstName, lastName, phone, role } = dto;

    if (role === Role.ADMIN) {
      throw new ForbiddenException(
        'La création d’un compte administrateur n’est pas autorisée.',
      );
    }

    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException(
        "Le nom d'utilisateur ou l'adresse e-mail existe déjà.",
      );
    }

    const saltOrRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS') ?? '10',
    );

    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const savedUserId = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);

      const profileRepo = manager.getRepository(InternalProfile);

      const user = userRepo.create({
        username,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role,
        userType: UserType.INTERNAL,
      });

      const createdUser = await userRepo.save(user);

      const profile = profileRepo.create({
        user: createdUser,
        phone,
      });

      await profileRepo.save(profile);

      return createdUser.id;
    });

    const user = await this.usersRepository.findOne({
      where: { id: savedUserId },
      relations: ['internalProfile'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur créé mais introuvable.');
    }

    return this.userResponseBuilder.build(user);
  }

  async getAllInternalUsers(
    dto: InternalUsersFilterDto,
  ): Promise<PaginatedResult<InternalUserResponseDto>> {
    const { search, role } = dto;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.internalProfile', 'internalProfile')
      .where('user.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('user.userType = :userType', {
        userType: UserType.INTERNAL,
      })
      .andWhere('user.role != :excludedRole', {
        excludedRole: Role.FOURNISSEUR,
      })
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.createdAt',
      ]);

    if (role) {
      qb.andWhere('user.role = :role', {
        role,
      });
    }

    if (search) {
      const normalizedSearch = `%${search.toLowerCase()}%`;

      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('LOWER(user.username) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(user.firstName) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(user.lastName) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(user.email) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(internalProfile.phone) LIKE :search', {
              search: normalizedSearch,
            });
        }),
      );
    }

    qb.orderBy('user.createdAt', 'DESC');

    const result = await paginate(qb, dto);

    return {
      ...result,

      data: plainToInstance(InternalUserResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async getInternalUserById(id: number): Promise<InternalUserDetailDto> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.internalProfile', 'internalProfile')
      .where('user.id = :id', {
        id,
      })
      .andWhere('user.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('user.userType = :userType', {
        userType: UserType.INTERNAL,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const response = this.userResponseBuilder.build(user);

    return plainToInstance(
      InternalUserDetailDto,
      {
        ...response,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async updateInternalUser(
    id: number,
    updateUserDto: UpdateInternalUserDto,
    requesterRole: Role,
  ) {
    const { username, email, role, phone, firstName, lastName } = updateUserDto;

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.internalProfile', 'internalProfile')
      .where('user.id = :id', {
        id,
      })
      .andWhere('user.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('user.userType = :userType', {
        userType: UserType.INTERNAL,
      })
      .andWhere('user.role != :excludedRole', {
        excludedRole: Role.FOURNISSEUR,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (user.role === Role.ADMIN && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Seul un administrateur peut modifier un compte administrateur.',
      );
    }

    if (role === Role.ADMIN && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Seul un administrateur peut attribuer le role administrateur.',
      );
    }

    if (username || email) {
      const conflict = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.id != :id', { id })
        .andWhere('user.isActive = :isActive', {
          isActive: true,
        })
        .andWhere(
          new Brackets((subQb) => {
            if (username) {
              subQb.where('user.username = :username', {
                username,
              });
            }

            if (email) {
              const method = username ? 'orWhere' : 'where';

              subQb[method]('user.email = :email', {
                email,
              });
            }
          }),
        )
        .getOne();

      if (conflict) {
        throw new ConflictException(
          "Le nom d'utilisateur ou l'adresse e-mail existe deja.",
        );
      }
    }

    if (username !== undefined) {
      user.username = username;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (firstName !== undefined) {
      user.firstName = firstName;
    }

    if (lastName !== undefined) {
      user.lastName = lastName;
    }

    if (role !== undefined) {
      user.role = role;
    }

    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);

      const profileRepo = manager.getRepository(InternalProfile);

      await userRepo.save(user);

      if (phone !== undefined) {
        if (!user.internalProfile) {
          user.internalProfile = profileRepo.create({
            user,
            phone,
          });
        } else {
          user.internalProfile.phone = phone;
        }

        await profileRepo.save(user.internalProfile);
      }
    });

    const updatedUser = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.internalProfile', 'internalProfile')
      .where('user.id = :id', {
        id,
      })
      .getOne();

    if (!updatedUser) {
      throw new NotFoundException('Utilisateur introuvable apres mise a jour.');
    }

    return this.userResponseBuilder.build(updatedUser);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
        isActive: true,
      },

      select: ['id', 'role', 'isActive'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException(
        'La suppression d’un compte administrateur est interdite.',
      );
    }

    await this.usersRepository.update({ id }, { isActive: false });

    return {
      id,
      isActive: false,
    };
  }
}
