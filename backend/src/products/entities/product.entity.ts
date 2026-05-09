import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { Depot } from '../../depots/entities/depot.entity';
import { ProductHistory } from './product-history.entity';
import { Stock } from '../../stocks/entities/stock.entity';
import { FournisseurProduct } from '../../fournisseur-products/entities/fournisseur-product.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codeBarre: string;

  @Column({ unique: true })
  ref: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv1Ht?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv2Ht?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv3Ht?: number;

  @Column('int')
  stockTot: number;

  @Column('int', { nullable: true })
  stockMin?: number;

  @Column('int', { nullable: true })
  stockIni?: number;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: Category | null;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  brand?: Brand | null;

  @ManyToOne(() => Depot, (depot) => depot.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  defaultDepot?: Depot | null;

  @OneToMany(() => ProductHistory, (history) => history.product)
  histories: ProductHistory[];

  @OneToMany(() => Stock, (stock) => stock.product)
  stocks: Stock[];

  @OneToMany(() => FournisseurProduct, (fp) => fp.product)
  fournisseurs: FournisseurProduct[];
}
