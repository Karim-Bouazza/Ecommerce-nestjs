import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UpdateDepotDto } from './dto/update-depot.dto';
import { Depot } from './entities/depot.entity';
import {
  DepotDetailsResponseDto,
  DepotListResponseDto,
} from './dto/depot-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DepotsService {
  constructor(
    @InjectRepository(Depot)
    private readonly depotsRepository: Repository<Depot>,
  ) {}

  async create(createDepotDto: CreateDepotDto): Promise<Depot> {
    const depot = this.depotsRepository.create(createDepotDto);
    return this.depotsRepository.save(depot);
  }

  async findAll(): Promise<DepotListResponseDto[]> {
    const depots = await this.depotsRepository.find({
      where: { isActive: true },
    });

    return plainToInstance(DepotListResponseDto, depots, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number): Promise<DepotDetailsResponseDto> {
    const depot = await this.depotsRepository
      .createQueryBuilder('depot')
      .leftJoinAndSelect(
        'depot.stocks',
        'stock',
        'stock.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect('stock.product', 'product')
      .select([
        'depot.id',
        'depot.name',
        'depot.address',
        'depot.isActive',
        'stock.id',
        'stock.quantity',
        'product.id',
        'product.name',
      ])
      .where('depot.id = :id', { id })
      .andWhere('depot.isActive = :depotActive', { depotActive: true })
      .getOne();

    if (!depot) {
      throw new NotFoundException('Depot introuvable.');
    }
    return new DepotDetailsResponseDto(depot as any);
  }

  async update(id: number, updateDepotDto: UpdateDepotDto): Promise<Depot> {
    const depot = await this.depotsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!depot) {
      throw new NotFoundException('Depot introuvable.');
    }

    Object.assign(depot, updateDepotDto);

    return this.depotsRepository.save(depot);
  }

  async remove(id: number) {
    const result = await this.depotsRepository.update(
      { id, isActive: true },
      { isActive: false },
    );

    if (!result.affected) {
      throw new NotFoundException('Depot introuvable.');
    }

    return { id, isActive: false };
  }
}
