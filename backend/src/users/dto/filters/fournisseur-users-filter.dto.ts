import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FournisseurUsersFilterDto extends PaginationDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  overCreditLimit?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  activeWithPositiveSolde?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lastActivityDays?: number;
}
