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
      where: { name, isActive: true },
    });

    if (isExistCategory) {
      throw new ConflictException('La categorie existe deja');
    }

    const newCategory = this.categoryRepository.create(createCategoryDto);

    const savedCategory = await this.categoryRepository.save(newCategory);
    return new CategoryResponseDto(savedCategory as any);
  }

  async findAll() {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
    });
    return categories.map(
      (category) => new CategoryResponseDto(category as any),
    );
  }

  async findOne(id: number) {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect(
        'category.products',
        'product',
        'product.isActive = :isActive',
        { isActive: true },
      )
      .where('category.id = :id', { id })
      .andWhere('category.isActive = :categoryActive', { categoryActive: true })
      .getOne();
    if (!category) {
      throw new NotFoundException('Categorie introuvable');
    }
    return new CategoryResponseDto(category as any);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });
    if (!category) {
      throw new NotFoundException('Categorie introuvable');
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: updateCategoryDto.name, isActive: true },
    });

    if (existingCategory && existingCategory.id !== id) {
      throw new ConflictException('Le nom de la categorie existe deja');
    }

    const updatedCategory = Object.assign(category, updateCategoryDto);

    const savedCategory = await this.categoryRepository.save(updatedCategory);
    return new CategoryResponseDto(savedCategory as any);
  }

  async remove(id: number) {
    const result = await this.categoryRepository.update(
      { id, isActive: true },
      { isActive: false },
    );

    if (!result.affected) {
      throw new NotFoundException('Categorie introuvable');
    }

    return { id, isActive: false };
  }
}
