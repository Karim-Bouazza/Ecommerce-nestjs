import { Expose, Transform } from 'class-transformer';

export class FournisseurProductResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }) => obj.fournisseur?.id ?? null)
  fournisseurId: number | null;

  @Expose()
  @Transform(({ obj }) => obj.product?.id ?? null)
  productId: number | null;

  @Expose()
  @Transform(({ obj }) => obj.product?.codeBarre ?? null)
  productCodeBarre: string | null;

  @Expose()
  @Transform(({ obj }) => obj.product?.name ?? null)
  productName: string | null;

  @Expose()
  paHt: number;

  @Expose()
  quantity: number;

  constructor(partial: Partial<FournisseurProductResponseDto>) {
    Object.assign(this, partial);
  }
}
