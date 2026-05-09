import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateFournisseurDto {
  // =========================
  // User fields
  // =========================

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // =========================
  // Fournisseur profile fields
  // =========================

  @IsOptional()
  @IsString()
  companyName?: string;

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
}
