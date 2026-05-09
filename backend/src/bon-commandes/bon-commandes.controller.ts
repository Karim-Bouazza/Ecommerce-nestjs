import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BonCommandesService } from './bon-commandes.service';
import { CreateBonCommandeDto } from './dto/create-bon-commande.dto';
import { UpdateBonCommandeDto } from './dto/update-bon-commande.dto';
import { CancelBonCommandeDto } from './dto/cancel-bon-commande.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('bon-commandes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BonCommandesController {
  constructor(private readonly bonCommandesService: BonCommandesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async create(
    @Body() createBonCommandeDto: CreateBonCommandeDto,
    @GetUser('sub') userId?: number,
  ) {
    const result = await this.bonCommandesService.create(
      createBonCommandeDto,
      userId,
    );
    return new ApiResponseDto(result, 'Bon de commande créé avec succès.');
  }

  @Post(':id/send')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async send(@Param('id') id: string, @GetUser('sub') userId: number) {
    const result = await this.bonCommandesService.send(+id, userId);
    return new ApiResponseDto(result, 'Bon de commande envoyé avec succès.');
  }

  @Post(':id/confirm')
  @Roles(Role.FOURNISSEUR)
  async confirm(@Param('id') id: string, @GetUser('sub') userId: number) {
    const result = await this.bonCommandesService.confirm(+id, userId);
    return new ApiResponseDto(result, 'Bon de commande confirmé avec succès.');
  }

  @Post(':id/cancel')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.FOURNISSEUR)
  async cancel(
    @Param('id') id: string,
    @GetUser('sub') userId: number,
    @Body() cancelBonCommandeDto: CancelBonCommandeDto,
  ) {
    const result = await this.bonCommandesService.cancel(
      +id,
      userId,
      cancelBonCommandeDto.cancellationReason,
    );
    return new ApiResponseDto(result, 'Bon de commande annulé avec succès.');
  }

  @Get()
  findAll() {
    return this.bonCommandesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bonCommandesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBonCommandeDto: UpdateBonCommandeDto,
  ) {
    return this.bonCommandesService.update(+id, updateBonCommandeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bonCommandesService.remove(+id);
  }
}
