import { Expose } from 'class-transformer';

export class CategoryProductDto {
  @Expose()
  id: number;

  @Expose()
  codeBarre: string;

  @Expose()
  name: string;
}
