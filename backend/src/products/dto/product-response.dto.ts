import { Expose, Transform } from 'class-transformer';

export class ProductsResponseDto {
  @Expose()
  codeBarre: string;

  @Expose()
  ref: string;

  @Expose()
  name: string;

  @Expose()
  pv1Ht: number;

  @Expose()
  pv2Ht: number;

  @Expose()
  pv3Ht: number;

  @Expose()
  stockTot: number;

  @Expose()
  stockMin: number;

  @Expose()
  stockIni: number;

  @Expose()
  image?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Transform(({ obj }) => obj.category?.name ?? null)
  categoryName: string | null;

  @Expose()
  @Transform(({ obj }) => obj.brand?.name ?? null)
  brandName: string | null;

  constructor(partial: Partial<ProductsResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ProductListResponseDto {
  @Expose()
  id: number;

  @Expose()
  codeBarre: string;

  @Expose()
  name: string;

  @Expose()
  stockTot: number;

  @Expose()
  stockMin: number;

  constructor(partial: Partial<ProductListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ProductDetailsResponseDto {
  @Expose()
  id: number;

  @Expose()
  codeBarre: string;

  @Expose()
  ref: string;

  @Expose()
  name: string;

  @Expose()
  pv1Ht: number;

  @Expose()
  pv2Ht: number;

  @Expose()
  pv3Ht: number;

  @Expose()
  stockTot: number;

  @Expose()
  stockMin: number;

  @Expose()
  stockIni: number;

  @Expose()
  image?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  category: string | null;

  @Expose()
  brand: string | null;

  @Expose()
  defaultDepot: string | null;
}
