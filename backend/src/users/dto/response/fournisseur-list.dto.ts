import { Expose } from 'class-transformer';

export class FournisseurListDto {
  @Expose()
  id: number;

  @Expose()
  userId: number | null;

  @Expose()
  username: string | null;

  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  companyName: string;

  @Expose()
  creditLimit?: number;

  @Expose()
  solde?: number;
}
