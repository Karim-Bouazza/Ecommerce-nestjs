import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role, UserType } from '../../common/enum/role.enum';
import { FournisseurProfile } from './fournisseur-profile.entity';
import { InternalProfile } from './internal-profile.entity';
import { ProductHistory } from '../../products/entities/product-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'enum', enum: UserType })
  userType: UserType;

  @OneToOne(() => FournisseurProfile, (p) => p.user, { nullable: true })
  fournisseurProfile: FournisseurProfile;

  @OneToOne(() => InternalProfile, (p) => p.user, { nullable: true })
  internalProfile: InternalProfile;

  @OneToMany(() => ProductHistory, (history) => history.user)
  productHistories: ProductHistory[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
