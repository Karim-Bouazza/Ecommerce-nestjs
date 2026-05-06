import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
