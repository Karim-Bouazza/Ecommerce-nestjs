import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { Product } from '../products/entities/product.entity';
import { Depot } from '../depots/entities/depot.entity';
import { plainToInstance } from 'class-transformer';
import { StockResponseDto } from './dto/stock-response.dto';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Depot)
    private readonly depotRepository: Repository<Depot>,
  ) {}

  async create(createStockDto: CreateStockDto) {
    const { productId, depotId, quantity } = createStockDto;

    const [product, depot] = await Promise.all([
      this.productRepository.findOne({
        where: { id: productId, isActive: true },
      }),
      this.depotRepository.findOne({
        where: { id: depotId, isActive: true },
      }),
    ]);

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    if (!depot) {
      throw new NotFoundException('Depot introuvable');
    }

    const existingStock = await this.stockRepository.findOne({
      where: {
        product: { id: productId },
        depot: { id: depotId },
        isActive: true,
      },
    });

    if (existingStock) {
      throw new ConflictException('Le stock existe deja pour ce depot');
    }

    const stock = this.stockRepository.create({
      product,
      depot,
      quantity,
    });

    const savedStock = await this.stockRepository.save(stock);
    return new StockResponseDto(savedStock);
  }

  async findAll() {
    const stocks = await this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('stock.depot', 'depot')
      .select([
        'stock.id',
        'stock.quantity',
        'stock.isActive',
        'product.id',
        'product.name',
        'depot.id',
        'depot.name',
      ])
      .where('stock.isActive = :isActive', { isActive: true })
      .getMany();

    return stocks.map((stock) => new StockResponseDto(stock));
  }

  async remove(id: number) {
    const result = await this.stockRepository.update(
      { id, isActive: true },
      { isActive: false },
    );

    if (!result.affected) {
      throw new NotFoundException('Stock introuvable');
    }

    const updatedStock = await this.stockRepository.findOne({
      where: { id },
      relations: ['product', 'depot'],
    });

    if (!updatedStock) {
      throw new NotFoundException('Stock introuvable');
    }

    return new StockResponseDto(updatedStock);
  }
}
