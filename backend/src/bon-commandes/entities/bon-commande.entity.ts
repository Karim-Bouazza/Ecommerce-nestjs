import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FournisseurProfile } from '../../users/entities/fournisseur-profile.entity';
import { BonCommandeItem } from './bon-commande-item.entity';

export enum BonCommandeStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  ENVOYE = 'ENVOYE',
  CONFIRME = 'CONFIRME',
  ANNULE = 'ANNULE',
}

export enum BonCommandeDeliveryMethod {
  EMAIL = 'EMAIL',
  PLATFORM = 'PLATFORM',
}

@Entity('bon_commandes')
export class BonCommande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  reference: string;

  @Column({
    type: 'enum',
    enum: BonCommandeStatus,
    default: BonCommandeStatus.EN_ATTENTE,
  })
  status: BonCommandeStatus;

  @Column({
    type: 'enum',
    enum: BonCommandeDeliveryMethod,
  })
  deliveryMethod: BonCommandeDeliveryMethod;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User | null;

  @ManyToOne(() => FournisseurProfile, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  fournisseur: FournisseurProfile;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: false })
  isTvaIncluded: boolean;

  @Column('decimal', { precision: 12, scale: 2 })
  totalHt: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalTva: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalTtc: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  approvedBy?: User | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  sentBy?: User | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  cancelledBy?: User | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string | null;

  @OneToMany(() => BonCommandeItem, (item) => item.bonCommande)
  items: BonCommandeItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
