import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserType } from '../enum/role.enum';
import { User } from '../../users/entities/user.entity';
import {
  ExternalUserResponseDto,
  InternalUserResponseDto,
  UserResponseDto,
} from '../../users/dto/response/user-response.dto';

@Injectable()
export class UserResponseBuilderService {
  build(user: User) {
    if (user.userType === UserType.EXTERNAL && user.fournisseurProfile) {
      return plainToInstance(
        ExternalUserResponseDto,
        {
          ...user,
          companyName: user.fournisseurProfile.companyName,
          tel01: user.fournisseurProfile.tel01,
          tel02: user.fournisseurProfile.tel02,
          address: user.fournisseurProfile.address,
          numRc: user.fournisseurProfile.numRc,
          numArt: user.fournisseurProfile.numArt,
          numNis: user.fournisseurProfile.numNis,
          numNif: user.fournisseurProfile.numNif,
          creditLimit: user.fournisseurProfile.creditLimit,
          InitialSolde: user.fournisseurProfile.InitialSolde,
        },
        {
          excludeExtraneousValues: true,
        },
      );
    }

    if (user.userType === UserType.INTERNAL && user.internalProfile) {
      return plainToInstance(
        InternalUserResponseDto,
        {
          ...user,
          phone: user.internalProfile.phone,
        },
        {
          excludeExtraneousValues: true,
        },
      );
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
