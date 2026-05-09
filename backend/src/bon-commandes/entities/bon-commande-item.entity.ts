import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BonCommande } from './bon-commande.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('bon_commande_items')
export class BonCommandeItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BonCommande, (bc) => bc.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  bonCommande: BonCommande;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  product: Product;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice: number;
}
