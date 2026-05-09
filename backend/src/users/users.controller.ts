import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateInternalUserDto } from './dto/create/create-internal-user.dto';

import { UpdateInternalUserDto } from './dto/update/update-internal-user.dto';

import { ApiResponseDto } from '../common/dto/api-response.dto';

import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

import { Role } from '../common/enum/role.enum';

import { InternalUsersFilterDto } from './dto/filters/internal-users-filter.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async createInternal(@Body() dto: CreateInternalUserDto) {
    const user = await this.usersService.createInternalUser(dto);

    return new ApiResponseDto(
      user,
      "L'utilisateur interne a été créé avec succès",
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async getAllInternalUsers(@Query() dto: InternalUsersFilterDto) {
    const users = await this.usersService.getAllInternalUsers(dto);

    return new ApiResponseDto(users, 'Liste des utilisateurs');
  }

  @Get('internal/:id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async getInternalUser(@Param('id') id: string) {
    const user = await this.usersService.getInternalUserById(+id);

    return new ApiResponseDto(user, 'Utilisateur trouvé');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async updateInternalUser(
    @Param('id') id: string,

    @Body()
    updateUserDto: UpdateInternalUserDto,

    @GetUser('role')
    requesterRole: Role,
  ) {
    const user = await this.usersService.updateInternalUser(
      +id,
      updateUserDto,
      requesterRole,
    );

    return new ApiResponseDto(user, 'Utilisateur mis à jour');
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async removeInternalUser(@Param('id') id: string) {
    const user = await this.usersService.remove(+id);

    return new ApiResponseDto(user, 'Utilisateur supprimé');
  }
}
