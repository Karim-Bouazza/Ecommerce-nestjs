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
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';

@Controller('brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ strategy: 'excludeAll' })
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async create(@Body() createBrandDto: CreateBrandDto) {
    const result = await this.brandsService.create(createBrandDto);
    return new ApiResponseDto(result, 'Marque creee avec succes');
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findAll() {
    const brands = await this.brandsService.findAll();
    return new ApiResponseDto(brands, 'Marques recuperees avec succes');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findOne(@Param('id') id: string) {
    const brand = await this.brandsService.findOne(+id);
    return new ApiResponseDto(brand, 'Marque recuperee avec succes');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    const updatedBrand = await this.brandsService.update(+id, updateBrandDto);
    return new ApiResponseDto(updatedBrand, 'Marque mise a jour avec succes');
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async remove(@Param('id') id: string) {
    const removedBrand = await this.brandsService.remove(+id);
    return new ApiResponseDto(removedBrand, 'Marque supprimee avec succes');
  }
}
