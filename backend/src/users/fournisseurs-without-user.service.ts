import { Injectable, NotFoundException } from '@nestjs/common';
import { FournisseurUsersFilterDto } from './dto/filters/fournisseur-users-filter.dto';
import { FournisseurListDto } from './dto/response/fournisseur-list.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { FournisseurProfile } from './entities/fournisseur-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { paginate } from '../common/utils/paginate.helper';
import { plainToInstance } from 'class-transformer';
import { CreateFournisseurProfileDto } from './dto/create/create-fournisseur-profile.dto';
import { FournisseurProfileResponseDto } from './dto/response/fournisseur-profile-response.dto';
import { UpdateFournisseurProfileDto } from './dto/update/update-fournisseur-profile.dto';

@Injectable()
export class FournisseursWithoutUserService {
  constructor(
    @InjectRepository(FournisseurProfile)
    private readonly fournisseurProfileRepository: Repository<FournisseurProfile>,

    private readonly dataSource: DataSource,
  ) {}

  async createFournisseurProfile(dto: CreateFournisseurProfileDto) {
    const profile = this.dataSource.getRepository(FournisseurProfile).create({
      ...dto,
    });

    const savedProfile = await this.dataSource
      .getRepository(FournisseurProfile)
      .save(profile);

    return plainToInstance(FournisseurProfileResponseDto, savedProfile, {
      excludeExtraneousValues: true,
    });
  }

  async getAllFournisseurProfilesWithoutUser(
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

      .where('fournisseurProfile.user IS NULL')

      .andWhere('fournisseurProfile.isActive = :isActive', {
        isActive: true,
      })

      .select([
        'fournisseurProfile.id',
        'fournisseurProfile.companyName',
        'fournisseurProfile.tel01',
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
      });
    }

    if (search) {
      const normalizedSearch = `%${search.toLowerCase()}%`;

      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('LOWER(fournisseurProfile.companyName) LIKE :search', {
              search: normalizedSearch,
            })

            .orWhere('LOWER(fournisseurProfile.tel01) LIKE :search', {
              search: normalizedSearch,
            });
        }),
      );
    }

    const result = await paginate(qb, dto);

    return {
      ...result,

      data: plainToInstance(FournisseurListDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async updateFournisseurProfileWithoutUser(
    id: number,
    dto: UpdateFournisseurProfileDto,
  ) {
    const profile = await this.fournisseurProfileRepository
      .createQueryBuilder('fournisseurProfile')
      .where('fournisseurProfile.id = :id', { id })
      .andWhere('fournisseurProfile.isActive = :isActive', { isActive: true })
      .andWhere('fournisseurProfile.user IS NULL')
      .getOne();

    if (!profile) {
      throw new NotFoundException('Fournisseur introuvable.');
    }

    Object.assign(profile, dto);

    const savedProfile = await this.fournisseurProfileRepository.save(profile);

    return plainToInstance(FournisseurProfileResponseDto, savedProfile, {
      excludeExtraneousValues: true,
    });
  }

  async getFournisseurProfileWithoutUserById(id: number) {
    const profile = await this.fournisseurProfileRepository
      .createQueryBuilder('fournisseurProfile')
      .where('fournisseurProfile.id = :id', { id })
      .andWhere('fournisseurProfile.isActive = :isActive', { isActive: true })
      .andWhere('fournisseurProfile.user IS NULL')
      .getOne();

    if (!profile) {
      throw new NotFoundException('Fournisseur introuvable.');
    }

    return plainToInstance(FournisseurProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  async removeFournisseurProfileWithoutUser(id: number) {
    const result = await this.fournisseurProfileRepository
      .createQueryBuilder()
      .update()
      .set({
        isActive: false,
      })
      .where('id = :id', { id })
      .andWhere('isActive = :isActive', {
        isActive: true,
      })
      .andWhere('userId IS NULL')
      .execute();

    if (!result.affected) {
      throw new NotFoundException('Fournisseur introuvable.');
    }

    return { id, isActive: false };
  }
}
