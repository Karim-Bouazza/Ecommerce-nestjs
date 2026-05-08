import { Expose } from 'class-transformer';
import { Role } from '../../../common/enum/role.enum';

export class InternalUserDetailDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  email?: string;

  @Expose()
  role: Role;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  phone?: string;
}
