import { Expose, Transform } from 'class-transformer';

export class ProductsResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  quantity: number;

  @Expose()
  price: number;

  @Expose()
  price_after_discount?: number;

  @Expose()
  @Transform(({ obj }) => obj.category.name)
  categoryName: string;

  constructor(partial: Partial<ProductsResponseDto>) {
    Object.assign(this, partial);
  }
}
