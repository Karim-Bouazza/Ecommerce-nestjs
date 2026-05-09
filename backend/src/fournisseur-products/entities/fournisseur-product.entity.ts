import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { FournisseurProfile } from '../../users/entities/fournisseur-profile.entity';

@Entity('fournisseur_products')
@Index(['fournisseur', 'product'], { unique: true })
export class FournisseurProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FournisseurProfile, (fournisseur) => fournisseur.products, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  fournisseur: FournisseurProfile;

  @ManyToOne(() => Product, (product) => product.fournisseurs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column('decimal', { precision: 12, scale: 2 })
  paHt: number;

  @Column('int')
  quantity: number;

  @Column({ default: true })
  isActive: boolean;
}
