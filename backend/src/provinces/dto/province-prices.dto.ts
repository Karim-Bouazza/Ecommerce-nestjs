import { Expose } from 'class-transformer';

export class ProvincePricesDto {
  @Expose()
  domicile: number;

  @Expose()
  stop_disk: number;
}
