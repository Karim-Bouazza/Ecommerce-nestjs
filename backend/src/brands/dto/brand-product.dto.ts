import { Expose } from 'class-transformer';

export class BrandProductDto {
  @Expose()
  id: number;

  @Expose()
  codeBarre: string;

  @Expose()
  name: string;
}
