import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FournisseurProductsService } from './fournisseur-products.service';
import { FournisseurProductsController } from './fournisseur-products.controller';
import { FournisseurProduct } from './entities/fournisseur-product.entity';
import { FournisseurProfile } from '../users/entities/fournisseur-profile.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FournisseurProduct, FournisseurProfile, Product]),
  ],
  controllers: [FournisseurProductsController],
  providers: [FournisseurProductsService],
})
export class FournisseurProductsModule {}
