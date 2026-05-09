import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductHistory } from './entities/product-history.entity';
import { ProductHistoryFactory } from './factories/product-history.factory';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import {
  ProductHistoryDetailsResponseDto,
  ProductHistoryListResponseDto,
} from './dto/product-history-response.dto';
import { plainToInstance } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductHistoryService {
  constructor(
    @InjectRepository(ProductHistory)
    private readonly historyRepo: Repository<ProductHistory>,
    private readonly historyFactory: ProductHistoryFactory,
  ) {}

  async createHistory(oldProduct: Product, newProduct: Product, user?: User) {
    const history = this.historyFactory.create(oldProduct, newProduct, user);
    return this.historyRepo.save(history);
  }

  async findAll() {
    const histories = await this.historyRepo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.user', 'user')
      .select([
        'history.id',
        'history.codeBarreOld',
        'history.codeBarreNew',
        'history.nameOld',
        'history.nameNew',
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
      ])
      .orderBy('history.dateOperation', 'DESC')
      .getMany();

    console.log(histories);

    return plainToInstance(
      ProductHistoryListResponseDto,
      histories.map((history) => ({
        ...history,

        userId: history.user?.id ?? null,

        username: history.user?.username ?? null,

        userFirstName: history.user?.firstName ?? null,

        userLastName: history.user?.lastName ?? null,
      })),
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async findOne(id: number) {
    const history = await this.historyRepo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.user', 'user')
      .select([
        'history.id',
        'history.dateOperation',
        'history.codeBarreOld',
        'history.codeBarreNew',
        'history.refOld',
        'history.refNew',
        'history.nameOld',
        'history.nameNew',
        'history.stockIniOld',
        'history.stockIniNew',
        'history.pv1HtOld',
        'history.pv1HtNew',
        'history.pv2HtOld',
        'history.pv2HtNew',
        'history.pv3HtOld',
        'history.pv3HtNew',
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
      ])
      .where('history.id = :id', { id })
      .getOne();

    if (!history) {
      throw new NotFoundException('Historique introuvable');
    }

    return plainToInstance(
      ProductHistoryDetailsResponseDto,
      {
        ...history,

        userId: history.user?.id ?? null,

        username: history.user?.username ?? null,

        userFirstName: history.user?.firstName ?? null,

        userLastName: history.user?.lastName ?? null,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
