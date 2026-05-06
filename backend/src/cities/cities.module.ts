import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Province } from '../provinces/entities/province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([City, Province])],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
