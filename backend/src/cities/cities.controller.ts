import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SerializeOptions,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';

@Controller('cities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.COMMERCIAL)
@SerializeOptions({ strategy: 'excludeAll' })
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    const city = await this.citiesService.create(createCityDto);
    return new ApiResponseDto(city, 'City created successfully');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    const city = await this.citiesService.update(+id, updateCityDto);
    return new ApiResponseDto(city, 'City updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const city = await this.citiesService.remove(+id);
    return new ApiResponseDto(city, 'City deleted successfully');
  }
}
