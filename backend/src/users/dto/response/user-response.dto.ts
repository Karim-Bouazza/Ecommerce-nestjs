import { Expose, Type } from 'class-transformer';
import { Role, UserType } from '../../../common/enum/role.enum';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: Role;

  @Expose()
  userType: UserType;
}

export class ExternalUserResponseDto extends UserResponseDto {
  @Expose()
  companyName: string;

  @Expose()
  tel01: string;

  @Expose()
  tel02: string;

  @Expose()
  address: string;

  @Expose()
  numRc: string;

  @Expose()
  numArt: string;

  @Expose()
  numNis: string;

  @Expose()
  numNif: string;

  @Expose()
  creditLimit: number;

  @Expose()
  InitialSolde: number;
}

export class InternalUserResponseDto extends UserResponseDto {
  @Expose()
  phone: string;
}
