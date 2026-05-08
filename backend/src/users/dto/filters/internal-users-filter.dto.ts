import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Role } from '../../../common/enum/role.enum';

export const internalUserSortFields = [
  'username',
  'firstName',
  'lastName',
  'email',
  'phone',
  'role',
  'createdAt',
] as const;

export type InternalUserSortBy = (typeof internalUserSortFields)[number];

export class InternalUsersFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
