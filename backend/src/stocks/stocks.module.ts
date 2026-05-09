import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { Product } from '../products/entities/product.entity';
import { Depot } from '../depots/entities/depot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, Product, Depot])],
  controllers: [StocksController],
  providers: [StocksService],
})
export class StocksModule {}
