import { Expose, Transform } from 'class-transformer';

export class CityResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.province.name)
  provinceName: string;

  constructor(partial: Partial<CityResponseDto>) {
    Object.assign(this, partial);
  }
}
