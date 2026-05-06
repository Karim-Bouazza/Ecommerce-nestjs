import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { Province } from './entities/province.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProvinceResponseDto } from './dto/province-response.dto';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async create(createProvinceDto: CreateProvinceDto) {
    const { name, code } = createProvinceDto;

    const isExist = await this.provinceRepository.findOne({
      where: [{ name }, { code }],
    });

    if (isExist) {
      throw new ConflictException(
        'Province with the same name or code already exists',
      );
    }

    const newProvince = await this.provinceRepository.create(createProvinceDto);
    const savedProvince = await this.provinceRepository.save(newProvince);
    return new ProvinceResponseDto(savedProvince);
  }

  async findAll() {
    const provinces = await this.provinceRepository.find();
    return provinces.map((provinces) => new ProvinceResponseDto(provinces));
  }

  async findOne(id: number) {
    const province = await this.provinceRepository.findOne({ where: { id } });
    if (!province) {
      throw new NotFoundException('Province not found');
    }
    return new ProvinceResponseDto(province);
  }

  async update(id: number, updateProvinceDto: UpdateProvinceDto) {
    const province = await this.provinceRepository.preload({
      id,
      ...updateProvinceDto,
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }
    const updatedProvince = await this.provinceRepository.save(province);
    return new ProvinceResponseDto(updatedProvince);
  }

  async remove(id: number) {
    const province = await this.provinceRepository.findOne({ where: { id } });
    if (!province) {
      throw new NotFoundException('Province not found');
    }
    const removedProvince = await this.provinceRepository.remove(province);
    return new ProvinceResponseDto(removedProvince);
  }
}
