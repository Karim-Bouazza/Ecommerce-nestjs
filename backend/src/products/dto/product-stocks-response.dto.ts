import { Expose, Transform, Type } from 'class-transformer';

export class ProductStockItemDto {
  @Expose()
  id: number;

  @Expose()
  quantity: number;

  @Expose()
  @Transform(({ obj }) => obj.depot?.id ?? null)
  depotId: number | null;

  @Expose()
  @Transform(({ obj }) => obj.depot?.name ?? null)
  depotName: string | null;
}

export class ProductStocksResponseDto {
  @Expose()
  id: number;

  @Expose()
  codeBarre: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ProductStockItemDto)
  stocks: ProductStockItemDto[];

  constructor(partial: Partial<ProductStocksResponseDto>) {
    Object.assign(this, partial);
  }
}
