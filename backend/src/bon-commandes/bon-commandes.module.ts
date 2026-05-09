import { Module } from '@nestjs/common';
import { BonCommandesService } from './bon-commandes.service';
import { BonCommandesController } from './bon-commandes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonCommande } from './entities/bon-commande.entity';
import { BonCommandeItem } from './entities/bon-commande-item.entity';
import { FournisseurProfile } from '../users/entities/fournisseur-profile.entity';
import { Product } from '../products/entities/product.entity';
import { FournisseurProduct } from '../fournisseur-products/entities/fournisseur-product.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BonCommande,
      BonCommandeItem,
      FournisseurProfile,
      Product,
      FournisseurProduct,
      User,
    ]),
  ],
  controllers: [BonCommandesController],
  providers: [BonCommandesService],
})
export class BonCommandesModule {}
