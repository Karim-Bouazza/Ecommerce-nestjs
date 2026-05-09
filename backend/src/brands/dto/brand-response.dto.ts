import { Expose, Type } from 'class-transformer';
import { BrandProductDto } from './brand-product.dto';

export class BrandResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Type(() => BrandProductDto)
  products: BrandProductDto[];

  constructor(partial: Partial<BrandResponseDto>) {
    Object.assign(this, partial);
  }
}
