import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { BrandResponseDto } from './dto/brand-response.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const { name } = createBrandDto;

    const existingBrand = await this.brandRepository.findOne({
      where: { name, isActive: true },
    });

    if (existingBrand) {
      throw new ConflictException('La marque existe deja');
    }

    const newBrand = this.brandRepository.create(createBrandDto);
    const savedBrand = await this.brandRepository.save(newBrand);
    return new BrandResponseDto(savedBrand);
  }

  async findAll() {
    const brands = await this.brandRepository.find({
      where: { isActive: true },
    });

    return brands.map((brand) => new BrandResponseDto(brand));
  }

  async findOne(id: number) {
    const brand = await this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect(
        'brand.products',
        'product',
        'product.isActive = :isActive',
        { isActive: true },
      )
      .where('brand.id = :id', { id })
      .andWhere('brand.isActive = :brandActive', { brandActive: true })
      .getOne();

    if (!brand) {
      throw new NotFoundException('Marque introuvable');
    }

    return new BrandResponseDto(brand);
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findOne({
      where: { id, isActive: true },
    });

    if (!brand) {
      throw new NotFoundException('Marque introuvable');
    }

    if (updateBrandDto.name) {
      const existingBrand = await this.brandRepository.findOne({
        where: { name: updateBrandDto.name, isActive: true },
      });

      if (existingBrand && existingBrand.id !== id) {
        throw new ConflictException('Le nom de la marque existe deja');
      }
    }

    const updatedBrand = Object.assign(brand, updateBrandDto);
    const savedBrand = await this.brandRepository.save(updatedBrand);
    return new BrandResponseDto(savedBrand);
  }

  async remove(id: number) {
    const result = await this.brandRepository.update(
      { id, isActive: true },
      { isActive: false },
    );

    if (!result.affected) {
      throw new NotFoundException('Marque introuvable');
    }

    return { id, isActive: false };
  }
}
