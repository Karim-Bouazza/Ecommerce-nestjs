import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductHistoryService } from './product-history.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('product-histories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductHistoryController {
  constructor(private readonly productHistoryService: ProductHistoryService) {}

  @Get()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async findAll() {
    const histories = await this.productHistoryService.findAll();
    return new ApiResponseDto(histories, 'Historiques récupérés avec succès.');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async findOne(@Param('id') id: string) {
    const history = await this.productHistoryService.findOne(+id);
    return new ApiResponseDto(history, 'Historique récupéré avec succès.');
  }
}
