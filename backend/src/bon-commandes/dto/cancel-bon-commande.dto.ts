import { IsOptional, IsString } from 'class-validator';

export class CancelBonCommandeDto {
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
