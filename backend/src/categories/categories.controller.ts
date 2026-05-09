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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ strategy: 'excludeAll' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const result = await this.categoriesService.create(createCategoryDto);
    return new ApiResponseDto(result, 'Categorie creee avec succes');
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return new ApiResponseDto(categories, 'Categories recuperees avec succes');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(+id);
    return new ApiResponseDto(category, 'Categorie recuperee avec succes');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const updatedCategory = await this.categoriesService.update(
      +id,
      updateCategoryDto,
    );
    return new ApiResponseDto(
      updatedCategory,
      'Categorie mise a jour avec succes',
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async remove(@Param('id') id: string) {
    const removedCategory = await this.categoriesService.remove(+id);
    return new ApiResponseDto(
      removedCategory,
      'Categorie supprimee avec succes',
    );
  }
}
