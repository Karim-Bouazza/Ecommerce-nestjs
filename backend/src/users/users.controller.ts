import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  SerializeOptions,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create/create-user.dto';
import { CreateInternalUserDto } from './dto/create/create-internal-user.dto';
import { CreateFournisseurDto } from './dto/create/create-fournisseur.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { InternalUsersFilterDto } from './dto/filters/internal-users-filter.dto';
import { FournisseurUsersFilterDto } from './dto/filters/fournisseur-users-filter.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

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

  @Get('me/internal/')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.TRANSPORTEUR, Role.OPERATEUR)
  async getMyInternalUser(@GetUser('sub') userId: number) {
    const user = await this.usersService.getMyInternalUser(userId);
    return new ApiResponseDto(user, 'Utilisateur trouvé');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // ====================================================
  // Fournisseur Endpoints
  // ====================================================

  @Post('fournisseur')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async createFournisseur(@Body() dto: CreateFournisseurDto) {
    const user = await this.usersService.createExternalUser(dto);
    return new ApiResponseDto(
      user,
      "L'utilisateur fournisseur a été créé avec succès.",
    );
  }

  @Get('fournisseur')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async getAllFournisseurs(@Query() dto: FournisseurUsersFilterDto) {
    const users = await this.usersService.getAllFournisseurUsers(dto);
    return new ApiResponseDto(users, 'Liste des utilisateurs fournisseurs');
  }

  @Get('fournisseur/:id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async getFournisseur(@Param('id') id: string) {
    const user = await this.usersService.getFournisseurById(+id);
    return new ApiResponseDto(user, 'Fournisseur trouvé');
  }

  @Get('me')
  @Roles(Role.FOURNISSEUR)
  async getMyFournisseur(@GetUser('sub') userId: number) {
    const user = await this.usersService.getMyFournisseurUser(userId);
    return new ApiResponseDto(user, 'Fournisseur trouvé');
  }
}
