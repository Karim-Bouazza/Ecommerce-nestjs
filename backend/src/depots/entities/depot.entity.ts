import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Stock } from '../../stocks/entities/stock.entity';

@Entity('depots')
export class Depot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Product, (product) => product.defaultDepot)
  products: Product[];

  @OneToMany(() => Stock, (stock) => stock.depot)
  stocks: Stock[];
}
