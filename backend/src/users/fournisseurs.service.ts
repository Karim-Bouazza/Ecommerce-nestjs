import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, DataSource, Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { ConfigService } from '@nestjs/config';

import { plainToInstance } from 'class-transformer';

import { User } from './entities/user.entity';
import { FournisseurProfile } from './entities/fournisseur-profile.entity';

import { Role, UserType } from '../common/enum/role.enum';

import { CreateFournisseurDto } from './dto/create/create-fournisseur.dto';
import { CreateFournisseurProfileDto } from './dto/create/create-fournisseur-profile.dto';

import { UpdateFournisseurDto } from './dto/update/update-fournisseur.dto';

import { FournisseurUsersFilterDto } from './dto/filters/fournisseur-users-filter.dto';

import { FournisseurDetailDto } from './dto/response/fournisseur-detail.dto';
import { FournisseurProfileResponseDto } from './dto/response/fournisseur-profile-response.dto';
import { FournisseurListDto } from './dto/response/fournisseur-list.dto';

import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

import { paginate } from '../common/utils/paginate.helper';

import { UserResponseBuilderService } from '../common/utils/user-response-builder.service';

@Injectable()
export class FournisseursService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(FournisseurProfile)
    private readonly fournisseurProfileRepository: Repository<FournisseurProfile>,

    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,

    private readonly userResponseBuilder: UserResponseBuilderService,
  ) {}

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
      throw new NotFoundException('Utilisateur créé mais introuvable.');
    }

    return this.userResponseBuilder.build(user);
  }

  async getAllFournisseurUsers(
    dto: FournisseurUsersFilterDto,
  ): Promise<PaginatedResult<FournisseurListDto>> {
    const {
      search,
      overCreditLimit,
      activeWithPositiveSolde,
      lastActivityDays,
    } = dto;

    const qb = this.fournisseurProfileRepository
      .createQueryBuilder('fournisseurProfile')
      .innerJoinAndSelect(
        'fournisseurProfile.user',
        'user',
        'user.isActive = :isActive AND user.userType = :userType AND user.role = :role',
        {
          isActive: true,
          userType: UserType.EXTERNAL,
          role: Role.FOURNISSEUR,
        },
      )
      .select([
        'fournisseurProfile.id',
        'fournisseurProfile.companyName',
        'fournisseurProfile.creditLimit',
        'fournisseurProfile.solde',

        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
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
            });
        }),
      );
    }

    const result = await paginate(qb, dto);
    console.log(result);

    return {
      ...result,

      data: plainToInstance(
        FournisseurListDto,

        result.data.map((fournisseur) => ({
          id: fournisseur.id,

          companyName: fournisseur.companyName,

          creditLimit: fournisseur.creditLimit,

          solde: fournisseur.solde,

          userId: fournisseur.user?.id ?? null,

          username: fournisseur.user?.username ?? null,

          firstName: fournisseur.user?.firstName ?? null,

          lastName: fournisseur.user?.lastName ?? null,
        })),

        {
          excludeExtraneousValues: true,
        },
      ),
    };
  }

  async getFournisseurById(id: number): Promise<FournisseurDetailDto> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.fournisseurProfile', 'fournisseurProfile')
      .where('user.id = :id', {
        id,
      })
      .andWhere('user.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('user.userType = :userType', {
        userType: UserType.EXTERNAL,
      })
      .andWhere('user.role = :role', {
        role: Role.FOURNISSEUR,
      })
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

  async updateFournisseurUser(
    id: number,
    updateDto: UpdateFournisseurDto,
  ): Promise<FournisseurDetailDto> {
    const {
      username,
      email,
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
    } = updateDto;

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.fournisseurProfile', 'fournisseurProfile')
      .where('user.id = :id', {
        id,
      })
      .andWhere('user.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('user.userType = :userType', {
        userType: UserType.EXTERNAL,
      })
      .andWhere('user.role = :role', {
        role: Role.FOURNISSEUR,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (username || email) {
      const conflict = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.id != :id', {
          id,
        })
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

    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);

      const profileRepo = manager.getRepository(FournisseurProfile);

      await userRepo.save(user);

      if (
        companyName !== undefined ||
        tel01 !== undefined ||
        tel02 !== undefined ||
        address !== undefined ||
        numRc !== undefined ||
        numArt !== undefined ||
        numNis !== undefined ||
        numNif !== undefined ||
        creditLimit !== undefined
      ) {
        if (!user.fournisseurProfile) {
          user.fournisseurProfile = profileRepo.create({
            user,
          });
        }

        if (companyName !== undefined) {
          user.fournisseurProfile.companyName = companyName;
        }

        if (tel01 !== undefined) {
          user.fournisseurProfile.tel01 = tel01;
        }

        if (tel02 !== undefined) {
          user.fournisseurProfile.tel02 = tel02;
        }

        if (address !== undefined) {
          user.fournisseurProfile.address = address;
        }

        if (numRc !== undefined) {
          user.fournisseurProfile.numRc = numRc;
        }

        if (numArt !== undefined) {
          user.fournisseurProfile.numArt = numArt;
        }

        if (numNis !== undefined) {
          user.fournisseurProfile.numNis = numNis;
        }

        if (numNif !== undefined) {
          user.fournisseurProfile.numNif = numNif;
        }

        if (creditLimit !== undefined) {
          user.fournisseurProfile.creditLimit = creditLimit;
        }

        await profileRepo.save(user.fournisseurProfile);
      }
    });

    return this.getFournisseurById(id);
  }
}
