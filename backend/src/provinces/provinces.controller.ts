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
import { ProvincesService } from './provinces.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('provinces')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ strategy: 'excludeAll' })
@Roles(Role.ADMIN)
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Post()
  async create(@Body() createProvinceDto: CreateProvinceDto) {
    const province = await this.provincesService.create(createProvinceDto);
    return new ApiResponseDto(province, 'Province created successfully');
  }

  @Get()
  async findAll() {
    const provinces = await this.provincesService.findAll();
    return new ApiResponseDto(provinces, 'Provinces retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const province = await this.provincesService.findOne(+id);
    return new ApiResponseDto(province, 'Province retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProvinceDto: UpdateProvinceDto,
  ) {
    const province = await this.provincesService.update(+id, updateProvinceDto);
    return new ApiResponseDto(province, 'Province updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.provincesService.remove(+id);
    return new ApiResponseDto(result, 'Province removed successfully');
  }
}
