import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthenticationService {

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService
  ) { }

  async login(createAuthenticationDto: CreateAuthenticationDto) {
    const { username, password } = createAuthenticationDto;

    const existingUser = await this.usersRepository.findOne({ where: { username } });

    if (!existingUser) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const payload = { sub: existingUser.id, username: existingUser.username };

    const accessToken: string = this.jwtService.sign(payload);

    return { accessToken };
  }


}
