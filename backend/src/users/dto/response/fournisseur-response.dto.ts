import { Expose } from 'class-transformer';

export class FournisseurResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  companyName: string;

  @Expose()
  creditLimit?: number;

  @Expose()
  solde?: number;
}
