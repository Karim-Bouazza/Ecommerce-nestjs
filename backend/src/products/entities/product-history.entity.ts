import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('product_histories')
export class ProductHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.histories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  product?: Product | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user?: User | null;

  @CreateDateColumn()
  dateOperation: Date;

  @Column({ nullable: true })
  codeBarreOld?: string;

  @Column({ nullable: true })
  codeBarreNew?: string;

  @Column({ nullable: true })
  refOld?: string;

  @Column({ nullable: true })
  refNew?: string;

  @Column({ nullable: true })
  nameOld?: string;

  @Column({ nullable: true })
  nameNew?: string;

  @Column('int', { nullable: true })
  stockIniOld?: number;

  @Column('int', { nullable: true })
  stockIniNew?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv1HtOld?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv1HtNew?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv2HtOld?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv2HtNew?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv3HtOld?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pv3HtNew?: number;
}
