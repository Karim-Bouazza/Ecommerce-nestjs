import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create/create-user.dto';
import { CreateInternalUserDto } from './dto/create/create-internal-user.dto';
import { CreateFournisseurDto } from './dto/create/create-fournisseur.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InternalProfile } from './entities/internal-profile.entity';
import { FournisseurProfile } from './entities/fournisseur-profile.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserResponseDto } from './dto/response/user-response.dto';
import { Role, UserType } from '../common/enum/role.enum';
import { plainToInstance } from 'class-transformer';
import { UserResponseBuilderService } from '../common/utils/user-response-builder.service';
import { InternalUserResponseDto } from './dto/response/internal-user-response.dto';
import { InternalUserDetailDto } from './dto/response/internal-user-detail.dto';
import { InternalUsersFilterDto } from './dto/filters/internal-users-filter.dto';
import { FournisseurUsersFilterDto } from './dto/filters/fournisseur-users-filter.dto';
import { FournisseurResponseDto } from './dto/response/fournisseur-response.dto';
import { FournisseurDetailDto } from './dto/response/fournisseur-detail.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.helper';

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

    const savedUser = await this.dataSource.transaction(async (manager) => {
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

      return createdUser;
    });

    const user = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ['internalProfile'],
    });

    if (!user) {
      throw new NotFoundException(
        'Utilisateur créé mais introuvable, veuillez réessayer.',
      );
    }

    return this.userResponseBuilder.build(user);
  }

  async getAllInternalUsers(
    dto: InternalUsersFilterDto,
  ): Promise<PaginatedResult<InternalUserResponseDto>> {
    const { search, role } = dto;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.internalProfile', 'internalProfile')
      .where('user.isActive = :isActive', { isActive: true })
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
      qb.andWhere('user.role = :role', { role });
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
      .leftJoin('user.internalProfile', 'internalProfile')
      .where('user.id = :id', { id })
      .andWhere('user.isActive = :isActive', { isActive: true })
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
        'user.email',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
        'internalProfile.phone',
      ])
      .getOne();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return plainToInstance(InternalUserDetailDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async getMyInternalUser(userId: number): Promise<InternalUserDetailDto> {
    console.log('Fetching internal user with ID:', userId);
    return this.getInternalUserById(userId);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // ====================================================
  // Fournisseur Endpoints
  // ====================================================

  async createExternalUser(dto: CreateFournisseurDto) {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      companyName,
      tel01,
      tel02,
      address,
      numRc,
      numArt,
      numNis,
      numNif,
      creditLimit,
      InitialSolde,
    } = dto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
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
      const profileRepo = manager.getRepository(FournisseurProfile);

      const user = userRepo.create({
        username,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: Role.FOURNISSEUR,
        userType: UserType.EXTERNAL,
      });

      const createdUser = await userRepo.save(user);

      const profile = profileRepo.create({
        user: createdUser,
        companyName,
        tel01,
        tel02,
        address,
        numRc,
        numArt,
        numNis,
        numNif,
        creditLimit,
        InitialSolde,
      });

      await profileRepo.save(profile);

      return createdUser.id;
    });

    const user = await this.usersRepository.findOne({
      where: { id: savedUserId },
      relations: ['fournisseurProfile'],
    });

    if (!user) {
      throw new NotFoundException(
        'Utilisateur créé mais introuvable, veuillez réessayer.',
      );
    }

    return this.userResponseBuilder.build(user);
  }

  async getAllFournisseurUsers(
    dto: FournisseurUsersFilterDto,
  ): Promise<PaginatedResult<FournisseurResponseDto>> {
    const {
      search,
      overCreditLimit,
      activeWithPositiveSolde,
      lastActivityDays,
    } = dto;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.fournisseurProfile', 'fournisseurProfile')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('user.userType = :userType', {
        userType: UserType.EXTERNAL,
      })
      .andWhere('user.role = :role', { role: Role.FOURNISSEUR })
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'fournisseurProfile.companyName',
        'fournisseurProfile.creditLimit',
        'fournisseurProfile.solde',
      ]);

    if (overCreditLimit) {
      qb.andWhere('fournisseurProfile.solde > fournisseurProfile.creditLimit');
    }

    if (activeWithPositiveSolde) {
      qb.andWhere('fournisseurProfile.solde > 0');
    }

    if (lastActivityDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lastActivityDays);
      qb.andWhere('fournisseurProfile.lastActivity >= :cutoffDate', {
        cutoffDate,
      }).andWhere('fournisseurProfile.solde > 0');
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
            .orWhere('LOWER(fournisseurProfile.companyName) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(fournisseurProfile.tel01) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(fournisseurProfile.tel02) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(fournisseurProfile.address) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(fournisseurProfile.numRc) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(fournisseurProfile.numArt) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(fournisseurProfile.numNis) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('LOWER(fournisseurProfile.numNif) LIKE :search', {
              search: normalizedSearch,
            })
            .orWhere(
              'LOWER(CONCAT(fournisseurProfile.creditLimit)) LIKE :search',
              {
                search: normalizedSearch,
              },
            )
            .orWhere('LOWER(CONCAT(fournisseurProfile.solde)) LIKE :search', {
              search: normalizedSearch,
            });
        }),
      );
    }

    const result = await paginate(qb, dto);

    return {
      ...result,
      data: plainToInstance(FournisseurResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async getMyFournisseurUser(userId: number): Promise<FournisseurDetailDto> {
    return this.getFournisseurById(userId);
  }

  async getFournisseurById(id: number): Promise<FournisseurDetailDto> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.fournisseurProfile', 'fournisseurProfile')
      .where('user.id = :id', { id })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('user.userType = :userType', {
        userType: UserType.EXTERNAL,
      })
      .andWhere('user.role = :role', { role: Role.FOURNISSEUR })
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
        'fournisseurProfile.companyName',
        'fournisseurProfile.tel01',
        'fournisseurProfile.tel02',
        'fournisseurProfile.address',
        'fournisseurProfile.numRc',
        'fournisseurProfile.numArt',
        'fournisseurProfile.numNis',
        'fournisseurProfile.numNif',
        'fournisseurProfile.achats',
        'fournisseurProfile.creditLimit',
        'fournisseurProfile.InitialSolde',
        'fournisseurProfile.solde',
        'fournisseurProfile.lastActivity',
      ])
      .getOne();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return plainToInstance(
      FournisseurDetailDto,
      {
        ...user,

        companyName: user.fournisseurProfile?.companyName,

        tel01: user.fournisseurProfile?.tel01,

        tel02: user.fournisseurProfile?.tel02,

        address: user.fournisseurProfile?.address,

        numRc: user.fournisseurProfile?.numRc,

        numArt: user.fournisseurProfile?.numArt,

        numNis: user.fournisseurProfile?.numNis,

        numNif: user.fournisseurProfile?.numNif,

        achats: user.fournisseurProfile?.achats,

        creditLimit: user.fournisseurProfile?.creditLimit,

        InitialSolde: user.fournisseurProfile?.InitialSolde,

        solde: user.fournisseurProfile?.solde,

        lastActivity: user.fournisseurProfile?.lastActivity,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
