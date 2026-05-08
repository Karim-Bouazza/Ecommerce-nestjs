import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/enum/role.enum';
import { Match } from '../../../common/decorators/match.decorator';

export class CreateInternalUserDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @Match('password', {
    message:
      'La confirmation du mot de passe ne correspond pas au mot de passe.',
  })
  passwordConfirmation: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(Role)
  role: Role;
}
