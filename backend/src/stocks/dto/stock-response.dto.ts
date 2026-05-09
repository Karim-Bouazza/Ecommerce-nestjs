import { Expose, Transform } from 'class-transformer';

export class StockResponseDto {
  @Expose()
  id: number;

  @Expose()
  quantity: number;

  @Expose()
  @Transform(({ obj }) => obj.product?.id ?? null)
  productId: number | null;

  @Expose()
  @Transform(({ obj }) => obj.product?.name ?? null)
  productName: string | null;

  @Expose()
  @Transform(({ obj }) => obj.depot?.id ?? null)
  depotId: number | null;

  @Expose()
  @Transform(({ obj }) => obj.depot?.name ?? null)
  depotName: string | null;

  constructor(partial: Partial<StockResponseDto>) {
    Object.assign(this, partial);
  }
}
