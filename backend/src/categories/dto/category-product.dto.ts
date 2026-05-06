import { Expose } from 'class-transformer';

export class CategoryProductDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
