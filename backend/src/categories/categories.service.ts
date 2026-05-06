import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;

    const isExistCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (isExistCategory) {
      throw new ConflictException('Category already exists');
    }

    const newCategory = this.categoryRepository.create(createCategoryDto);

    const savedCategory = await this.categoryRepository.save(newCategory);
    return new CategoryResponseDto(savedCategory);
  }

  async findAll() {
    const categories = await this.categoryRepository.find();
    return categories.map((category) => new CategoryResponseDto(category));
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: {
        products: true,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return new CategoryResponseDto(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: updateCategoryDto.name },
    });

    if (existingCategory && existingCategory.id !== id) {
      throw new ConflictException('Category name already exists');
    }

    const updatedCategory = Object.assign(category, updateCategoryDto);

    const savedCategory = await this.categoryRepository.save(updatedCategory);
    return new CategoryResponseDto(savedCategory);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.remove(category);
    return new CategoryResponseDto(category);
  }
}
