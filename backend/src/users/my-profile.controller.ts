import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

import { Role } from '../common/enum/role.enum';

import { ApiResponseDto } from '../common/dto/api-response.dto';

import { UpdateMyProfileDto } from './dto/update/update-my-profile.dto';
import { UpdateMyFournisseurProfileDto } from './dto/update/update-my-fournisseur-profile.dto';
import { MyProfileService } from './my-profile.service';


@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MyProfileController {
  constructor(private readonly myProfileService: MyProfileService) {}

  @Get('user')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.TRANSPORTEUR, Role.OPERATEUR)
  async getMyInternalProfile(@GetUser('sub') userId: number) {
    const user = await this.myProfileService.getMyInternalProfile(userId);

    return new ApiResponseDto(user, 'Utilisateur trouvé');
  }

  @Patch('user')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.TRANSPORTEUR, Role.OPERATEUR)
  async updateMyInternalProfile(
    @GetUser('sub') userId: number,
    @Body() dto: UpdateMyProfileDto,
  ) {
    const user = await this.myProfileService.updateMyInternalProfile(
      userId,
      dto,
    );

    return new ApiResponseDto(user, 'Profil mis à jour');
  }

  @Get('fournisseur')
  @Roles(Role.FOURNISSEUR)
  async getMyFournisseurProfile(@GetUser('sub') userId: number) {
    const user = await this.myProfileService.getMyFournisseurProfile(userId);

    return new ApiResponseDto(user, 'Fournisseur trouvé');
  }

  @Patch('fournisseur')
  @Roles(Role.FOURNISSEUR)
  async updateMyFournisseurProfile(
    @GetUser('sub') userId: number,
    @Body()
    dto: UpdateMyFournisseurProfileDto,
  ) {
    const user = await this.myProfileService.updateMyFournisseurProfile(
      userId,
      dto,
    );

    return new ApiResponseDto(user, 'Profil mis à jour');
  }
}
