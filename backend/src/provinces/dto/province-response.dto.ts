import { Expose, Transform, Type } from 'class-transformer';
import { ProvincePricesDto } from './province-prices.dto';
import { ProvinceCitiesDto } from './province-cities.dto';

export class ProvinceResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: number;

  @Expose()
  @Type(() => ProvincePricesDto)
  @Transform(({ obj }) => ({
    domicile: obj.price_domicile ? parseFloat(obj.price_domicile) : null,
    stop_disk: obj.price_stop_disk ? parseFloat(obj.price_stop_disk) : null,
  }))
  prices: ProvincePricesDto;

  @Expose()
  @Type(() => ProvinceCitiesDto)
  cities: ProvinceCitiesDto[];

  constructor(partial: Partial<ProvinceResponseDto>) {
    Object.assign(this, partial);
  }
}
