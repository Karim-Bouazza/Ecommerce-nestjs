import { Expose } from 'class-transformer';

export class FournisseurProfileResponseDto {
  @Expose()
  id: number;

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
