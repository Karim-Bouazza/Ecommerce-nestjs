import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateStockDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  depotId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;
}
