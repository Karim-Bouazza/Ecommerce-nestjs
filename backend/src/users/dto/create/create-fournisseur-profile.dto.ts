import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFournisseurProfileDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  tel01?: string;

  @IsOptional()
  @IsString()
  tel02?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  numRc?: string;

  @IsOptional()
  @IsString()
  numArt?: string;

  @IsOptional()
  @IsString()
  numNis?: string;

  @IsOptional()
  @IsString()
  numNif?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  InitialSolde?: number;
}
