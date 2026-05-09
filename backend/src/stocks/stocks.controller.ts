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
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('stocks')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ strategy: 'excludeAll' })
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async create(@Body() createStockDto: CreateStockDto) {
    const stock = await this.stocksService.create(createStockDto);
    return new ApiResponseDto(stock, 'Stock créé avec succès.');
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findAll() {
    const stocks = await this.stocksService.findAll();
    return new ApiResponseDto(stocks, 'Stocks recuperes avec succes');
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async remove(@Param('id') id: string) {
    const removedStock = await this.stocksService.remove(+id);
    return new ApiResponseDto(removedStock, 'Stock supprime avec succes');
  }
}
