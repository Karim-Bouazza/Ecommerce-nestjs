import { Expose } from 'class-transformer';

export class DeleteProductResponseDto {
  @Expose()
  codeBarre: string;

  @Expose()
  isActive: boolean;
}
