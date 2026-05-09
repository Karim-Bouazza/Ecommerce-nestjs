import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { FournisseurUsersFilterDto } from './dto/filters/fournisseur-users-filter.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FournisseursWithoutUserService } from './fournisseurs-without-user.service';
import { CreateFournisseurProfileDto } from './dto/create/create-fournisseur-profile.dto';
import { UpdateFournisseurProfileDto } from './dto/update/update-fournisseur-profile.dto';

@Controller('fournisseurs-profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FournisseursWithoutUserController {
  constructor(
    private readonly fournisseursWithoutUserService: FournisseursWithoutUserService,
  ) {}

  @Post('create-profile')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async createFournisseurProfile(
    @Body()
    dto: CreateFournisseurProfileDto,
  ) {
    const profile =
      await this.fournisseursWithoutUserService.createFournisseurProfile(dto);

    return new ApiResponseDto(profile, 'Profil fournisseur créé avec succès.');
  }

  @Get('without-user')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async getFournisseursWithoutUser(@Query() dto: FournisseurUsersFilterDto) {
    const profiles =
      await this.fournisseursWithoutUserService.getAllFournisseurProfilesWithoutUser(
        dto,
      );

    return new ApiResponseDto(
      profiles,
      'Liste des fournisseurs sans utilisateur',
    );
  }

  @Get('without-user/:id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async getFournisseurWithoutUser(@Param('id') id: string) {
    const profile =
      await this.fournisseursWithoutUserService.getFournisseurProfileWithoutUserById(
        +id,
      );

    return new ApiResponseDto(profile, 'Fournisseur trouvé');
  }

  @Patch('without-user/:id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async updateFournisseurWithoutUser(
    @Param('id') id: string,
    @Body() dto: UpdateFournisseurProfileDto,
  ) {
    const profile =
      await this.fournisseursWithoutUserService.updateFournisseurProfileWithoutUser(
        +id,
        dto,
      );

    return new ApiResponseDto(
      profile,
      'Fournisseur sans utilisateur mis à jour.',
    );
  }

  @Delete('without-user/:id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async removeFournisseurWithoutUser(@Param('id') id: string) {
    const result =
      await this.fournisseursWithoutUserService.removeFournisseurProfileWithoutUser(
        +id,
      );

    return new ApiResponseDto(result, 'Fournisseur sans utilisateur supprimé.');
  }
}
