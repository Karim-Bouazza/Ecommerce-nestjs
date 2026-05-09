import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { Role } from '../../../common/enum/role.enum';

export class UpdateInternalUserDto {
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

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  phone?: string;
}
