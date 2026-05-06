import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProvinceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  code: number;

  @IsNumber()
  @IsOptional()
  price_domicile?: number;

  @IsNumber()
  @IsOptional()
  price_stop_disk?: number;
}
