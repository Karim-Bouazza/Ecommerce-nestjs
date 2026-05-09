import { Expose, Transform } from 'class-transformer';

export class ProductHistoryListResponseDto {
  @Expose()
  id: number;

  @Expose()
  codeBarreOld?: string;

  @Expose()
  codeBarreNew?: string;

  @Expose()
  nameOld?: string;

  @Expose()
  nameNew?: string;

  @Expose()
  userId: number | null;

  @Expose()
  username: string | null;

  @Expose()
  userFirstName: string | null;

  @Expose()
  userLastName: string | null;
}

export class ProductHistoryDetailsResponseDto {
  @Expose()
  id: number;

  @Expose()
  dateOperation: Date;

  @Expose()
  codeBarreOld?: string;

  @Expose()
  codeBarreNew?: string;

  @Expose()
  refOld?: string;

  @Expose()
  refNew?: string;

  @Expose()
  nameOld?: string;

  @Expose()
  nameNew?: string;

  @Expose()
  stockIniOld?: number;

  @Expose()
  stockIniNew?: number;

  @Expose()
  pv1HtOld?: number;

  @Expose()
  pv1HtNew?: number;

  @Expose()
  pv2HtOld?: number;

  @Expose()
  pv2HtNew?: number;

  @Expose()
  pv3HtOld?: number;

  @Expose()
  pv3HtNew?: number;

  @Expose()
  userId: number | null;

  @Expose()
  username: string | null;

  @Expose()
  userFirstName: string | null;

  @Expose()
  userLastName: string | null;
}
