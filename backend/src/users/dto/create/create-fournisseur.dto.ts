import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Match } from '../../../common/decorators/match.decorator';

export class CreateFournisseurDto {
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

  // ───── Fournisseur Profile ─────

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
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  InitialSolde?: number;
}
