import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserResponseDto } from './dto/user-response.dto';
import { Role } from '../common/enum/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or Email already exists');
    }

    const saltOrRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS') ?? '10',
    );
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      role: Role.ADMIN,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);

    return new UserResponseDto(savedUser);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
