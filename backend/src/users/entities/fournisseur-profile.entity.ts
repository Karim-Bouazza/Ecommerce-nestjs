import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FournisseurProduct } from '../../fournisseur-products/entities/fournisseur-product.entity';

@Entity('fournisseur_profiles')
export class FournisseurProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user?: User | null;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  tel01?: string;

  @Column({ nullable: true })
  tel02?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  numRc?: string;

  @Column({ nullable: true })
  numArt?: string;

  @Column({ nullable: true })
  numNis?: string;

  @Column({ nullable: true })
  numNif?: string;

  @Column({ nullable: true })
  achats?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0,
  })
  creditLimit?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0,
  })
  solde?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0,
  })
  InitialSolde?: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActivity?: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => FournisseurProduct, (fp) => fp.fournisseur)
  products: FournisseurProduct[];
}
