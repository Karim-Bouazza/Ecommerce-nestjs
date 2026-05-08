import { Expose } from 'class-transformer';
import { Role } from '../../../common/enum/role.enum';

export class FournisseurDetailDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  email?: string;

  @Expose()
  role: Role;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  companyName: string;

  @Expose()
  tel01?: string;

  @Expose()
  tel02?: string;

  @Expose()
  address?: string;

  @Expose()
  numRc?: string;

  @Expose()
  numArt?: string;

  @Expose()
  numNis?: string;

  @Expose()
  numNif?: string;

  @Expose()
  achats?: string;

  @Expose()
  creditLimit?: number;

  @Expose()
  InitialSolde?: number;

  @Expose()
  solde?: number;

  @Expose()
  lastActivity?: Date;
}
