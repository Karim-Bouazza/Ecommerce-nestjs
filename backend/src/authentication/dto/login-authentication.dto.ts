import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthenticationDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
