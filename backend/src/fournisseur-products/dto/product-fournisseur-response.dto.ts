import { Expose, Transform } from 'class-transformer';

export class ProductFournisseurResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }) => obj.product?.id ?? null)
  productId: number | null;

  @Expose()
  @Transform(({ obj }) => obj.fournisseur?.id ?? null)
  fournisseurId: number | null;

  @Expose()
  @Transform(({ obj }) => obj.fournisseur?.companyName ?? null)
  fournisseurCompanyName: string | null;

  @Expose()
  paHt: number;

  constructor(partial: Partial<ProductFournisseurResponseDto>) {
    Object.assign(this, partial);
  }
}
