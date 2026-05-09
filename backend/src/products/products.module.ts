import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Depot } from '../depots/entities/depot.entity';
import { ProductHistory } from './entities/product-history.entity';
import { ProductHistoryService } from './product-history.service';
import { ProductHistoryFactory } from './factories/product-history.factory';
import { User } from '../users/entities/user.entity';
import { ProductHistoryController } from './product-history.controller';
import { Stock } from '../stocks/entities/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      Depot,
      ProductHistory,
      Stock,
      User,
    ]),
  ],
  controllers: [ProductsController, ProductHistoryController],
  providers: [ProductsService, ProductHistoryService, ProductHistoryFactory],
})
export class ProductsModule {}
