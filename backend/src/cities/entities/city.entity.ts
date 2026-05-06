import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Province } from '../../provinces/entities/province.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Province, (province) => province.cities, {
    onDelete: 'CASCADE',
  })
  province: Province;
}
