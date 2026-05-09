import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepotDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
