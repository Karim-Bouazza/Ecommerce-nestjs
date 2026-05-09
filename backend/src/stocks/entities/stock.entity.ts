import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Depot } from '../../depots/entities/depot.entity';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.stocks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => Depot, (depot) => depot.stocks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  depot: Depot;

  @Column('int')
  quantity: number;

  @Column({ default: true })
  isActive: boolean;
}
