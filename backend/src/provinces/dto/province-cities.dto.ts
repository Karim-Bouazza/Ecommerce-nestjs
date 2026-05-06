import { Expose } from 'class-transformer';

export class ProvinceCitiesDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  constructor(partial: Partial<ProvinceCitiesDto>) {
    Object.assign(this, partial);
  }
}
