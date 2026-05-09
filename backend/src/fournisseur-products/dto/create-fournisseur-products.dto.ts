import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class FournisseurProductItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paHt: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;
}

export class CreateFournisseurProductsDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FournisseurProductItemDto)
  items: FournisseurProductItemDto[];
}
