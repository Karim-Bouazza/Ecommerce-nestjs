import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { BonCommandeDeliveryMethod } from '../entities/bon-commande.entity';

export class CreateBonCommandeItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateBonCommandeDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fournisseurId: number;

  @IsEnum(BonCommandeDeliveryMethod)
  deliveryMethod: BonCommandeDeliveryMethod;

  @IsOptional()
  @IsBoolean()
  isTvaIncluded?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateBonCommandeItemDto)
  items: CreateBonCommandeItemDto[];
}
