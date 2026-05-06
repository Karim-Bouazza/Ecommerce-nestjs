import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity()
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price_domicile?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price_stop_disk?: number;

  @OneToMany(() => City, (city) => city.province)
  cities: City[];
}
