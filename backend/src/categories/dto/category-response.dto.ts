import { Expose, Type } from 'class-transformer';
import { CategoryProductDto } from './category-product.dto';

export class CategoryResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Type(() => CategoryProductDto)
  products: CategoryProductDto[];

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
