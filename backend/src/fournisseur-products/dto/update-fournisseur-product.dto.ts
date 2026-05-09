import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFournisseurProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paHt?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number;
}
