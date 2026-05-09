import { Expose, Type } from 'class-transformer';
import { DepotStockDto } from './depot-stock.dto';

export class DepotListResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  isActive: boolean;

  constructor(partial: Partial<DepotListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class DepotDetailsResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => DepotStockDto)
  stocks: DepotStockDto[];

  constructor(partial: Partial<DepotDetailsResponseDto>) {
    Object.assign(this, partial);
  }
}
