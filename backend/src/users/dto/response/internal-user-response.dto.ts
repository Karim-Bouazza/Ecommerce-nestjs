import { Expose } from 'class-transformer';
import { Role } from '../../../common/enum/role.enum';

export class InternalUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  role: Role;
}
