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
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_after_discount?: number;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
