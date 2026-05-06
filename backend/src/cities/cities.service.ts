import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from '../provinces/entities/province.entity';
import { CityResponseDto } from './dto/city-response.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async create(createCityDto: CreateCityDto) {
    const { name, provinceId } = createCityDto;

    const isExist = await this.citiesRepository.findOne({
      where: { name },
    });
    if (isExist) {
      throw new ConflictException('City already exists');
    }

    const province = await this.provinceRepository.findOne({
      where: { id: provinceId },
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const city = this.citiesRepository.create({
      name,
      province,
    });
    const savedCity = await this.citiesRepository.save(city);
    return new CityResponseDto(savedCity);
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    const { name } = updateCityDto;

    const city = await this.citiesRepository.findOne({
      where: { id },
      relations: {
        province: true,
      },
    });
    if (!city) {
      throw new NotFoundException('City not found');
    }

    const isExist = await this.citiesRepository.findOne({
      where: { name },
    });
    if (isExist && isExist.id !== id) {
      throw new ConflictException('City with the same name already exists');
    }

    Object.assign(city, { name });

    const updatedCity = await this.citiesRepository.save(city);
    return new CityResponseDto(updatedCity);
  }

  async remove(id: number) {
    const city = await this.citiesRepository.findOne({
      where: { id },
      relations: {
        province: true,
      },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    const removedCity = await this.citiesRepository.remove(city);
    return new CityResponseDto(removedCity);
  }
}
