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
@Roles(Role.ADMIN)
@SerializeOptions({ strategy: 'excludeAll' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const result = await this.categoriesService.create(createCategoryDto);
    return new ApiResponseDto(result, 'Category created successfully');
  }

  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return new ApiResponseDto(categories, 'Categories retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(+id);
    return new ApiResponseDto(category, 'Category retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const updatedCategory = await this.categoriesService.update(
      +id,
      updateCategoryDto,
    );
    return new ApiResponseDto(updatedCategory, 'Category updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const removedCategory = await this.categoriesService.remove(+id);
    return new ApiResponseDto(removedCategory, 'Category removed successfully');
  }
}
