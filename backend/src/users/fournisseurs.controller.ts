import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { FournisseursService } from './fournisseurs.service';

import { CreateFournisseurDto } from './dto/create/create-fournisseur.dto';
import { CreateFournisseurProfileDto } from './dto/create/create-fournisseur-profile.dto';

import { UpdateFournisseurDto } from './dto/update/update-fournisseur.dto';

import { FournisseurUsersFilterDto } from './dto/filters/fournisseur-users-filter.dto';

import { ApiResponseDto } from '../common/dto/api-response.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';

import { Role } from '../common/enum/role.enum';

@Controller('fournisseurs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FournisseursController {
  constructor(private readonly fournisseursService: FournisseursService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async createFournisseur(@Body() dto: CreateFournisseurDto) {
    const user = await this.fournisseursService.createExternalUser(dto);

    return new ApiResponseDto(
      user,
      "L'utilisateur fournisseur a été créé avec succès.",
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async getAllFournisseurs(@Query() dto: FournisseurUsersFilterDto) {
    const users = await this.fournisseursService.getAllFournisseurUsers(dto);
    return new ApiResponseDto(users, 'Liste des utilisateurs fournisseurs');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async getFournisseur(@Param('id') id: string) {
    const user = await this.fournisseursService.getFournisseurById(+id);

    return new ApiResponseDto(user, 'Fournisseur trouvé');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async updateFournisseur(
    @Param('id') id: string,

    @Body()
    updateDto: UpdateFournisseurDto,
  ) {
    const user = await this.fournisseursService.updateFournisseurUser(
      +id,
      updateDto,
    );

    return new ApiResponseDto(user, 'Fournisseur mis à jour');
  }
}
