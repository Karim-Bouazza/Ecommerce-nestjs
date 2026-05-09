import { Expose, Transform } from 'class-transformer';

export class DepotStockDto {
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
}
