import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SerializeOptions,
} from '@nestjs/common';
import { DepotsService } from './depots.service';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UpdateDepotDto } from './dto/update-depot.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';

@Controller('depots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepotsController {
  constructor(private readonly depotsService: DepotsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async create(@Body() createDepotDto: CreateDepotDto) {
    const depot = await this.depotsService.create(createDepotDto);
    return new ApiResponseDto(depot, 'Depot créé');
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findAll() {
    const depots = await this.depotsService.findAll();
    return new ApiResponseDto(depots, 'Liste des depots');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  @SerializeOptions({ strategy: 'excludeAll' })
  async findOne(@Param('id') id: string) {
    const depot = await this.depotsService.findOne(+id);
    return new ApiResponseDto(depot, 'Depot trouvé');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async update(
    @Param('id') id: string,
    @Body() updateDepotDto: UpdateDepotDto,
  ) {
    const depot = await this.depotsService.update(+id, updateDepotDto);
    return new ApiResponseDto(depot, 'Depot mis à jour');
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async remove(@Param('id') id: string) {
    const result = await this.depotsService.remove(+id);
    return new ApiResponseDto(result, 'Depot supprimé');
  }
}
