import { IsNotEmpty, IsString } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';

export class RegisterAuthenticationDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password')
  password_confirmation: string;
}
