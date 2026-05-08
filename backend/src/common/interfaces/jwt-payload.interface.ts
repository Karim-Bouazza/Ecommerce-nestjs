import { Role, UserType } from '../enum/role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  userType: UserType;
}
