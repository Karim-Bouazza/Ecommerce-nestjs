import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

import { UsersService } from './users.service';
import { InternalUserDetailDto } from './dto/response/internal-user-detail.dto';
import { UpdateMyProfileDto } from './dto/update/update-my-profile.dto';
import { Role, UserType } from '../common/enum/role.enum';
import { InternalProfile } from './entities/internal-profile.entity';
import { FournisseurDetailDto } from './dto/response/fournisseur-detail.dto';
import { UpdateMyFournisseurProfileDto } from './dto/update/update-my-fournisseur-profile.dto';
import { FournisseurProfile } from './entities/fournisseur-profile.entity';
import { FournisseursService } from './fournisseurs.service';

@Injectable()
export class MyProfileService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly dataSource: DataSource,
    private readonly fournisseursService: FournisseursService,
    private readonly usersService: UsersService,
  ) {}

  async getMyInternalProfile(userId: number): Promise<InternalUserDetailDto> {
    return this.usersService.getInternalUserById(userId);
  }

  async updateMyInternalProfile(
    userId: number,
    updateDto: UpdateMyProfileDto,
  ): Promise<InternalUserDetailDto> {
    const { username, email, firstName, lastName, phone } = updateDto;

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.internalProfile', 'internalProfile')
      .where('user.id = :id', { id: userId })
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

    if (username || email) {
      const conflict = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.id != :id', { id: userId })
        .andWhere('user.isActive = :isActive', {
          isActive: true,
        })
        .andWhere(
          new Brackets((subQb) => {
            if (username) {
              subQb.where('user.username = :username', { username });
            }

            if (email) {
              const method = username ? 'orWhere' : 'where';

              subQb[method]('user.email = :email', { email });
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

    return this.usersService.getInternalUserById(userId);
  }

  async getMyFournisseurProfile(userId: number): Promise<FournisseurDetailDto> {
    return this.fournisseursService.getFournisseurById(userId);
  }

  async updateMyFournisseurProfile(
    userId: number,
    updateDto: UpdateMyFournisseurProfileDto,
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
    } = updateDto;

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.fournisseurProfile', 'fournisseurProfile')
      .where('user.id = :id', { id: userId })
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
        .where('user.id != :id', { id: userId })
        .andWhere('user.isActive = :isActive', {
          isActive: true,
        })
        .andWhere(
          new Brackets((subQb) => {
            if (username) {
              subQb.where('user.username = :username', { username });
            }

            if (email) {
              const method = username ? 'orWhere' : 'where';

              subQb[method]('user.email = :email', { email });
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
        numNif !== undefined
      ) {
        if (!user.fournisseurProfile) {
          user.fournisseurProfile = profileRepo.create({ user });
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

        await profileRepo.save(user.fournisseurProfile);
      }
    });

    return this.fournisseursService.getFournisseurById(userId);
  }
}
