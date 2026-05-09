import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  codeBarre: string;

  @IsString()
  @IsNotEmpty()
  ref: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pv1Ht: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pv2Ht: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pv3Ht: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockMin: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockIni: number;

  @IsString()
  @IsOptional()
  image?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  brandId?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  depotId?: number;
}
