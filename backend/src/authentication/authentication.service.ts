import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthenticationDto } from './dto/login-authentication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterAuthenticationDto } from './dto/register-authentication.dto';
import { Role } from '../common/enum/role.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginAuthenticationDto: LoginAuthenticationDto) {
    const { username, password } = loginAuthenticationDto;

    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });

    if (!existingUser) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(existingUser);

    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      parseInt(this.configService.get('BCRYPT_SALT_ROUNDS') ?? '10'),
    );
    await this.usersRepository.update(existingUser.id, {
      refreshToken: hashedRefreshToken,
    });

    return { accessToken, refreshToken };
  }

  async register(registerAuthenticationDto: RegisterAuthenticationDto) {
    const { username, email, password } = registerAuthenticationDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const saltOrRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS') ?? '10',
    );
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const newUser = this.usersRepository.create({
      ...registerAuthenticationDto,
      role: Role.CLIENT,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { accessToken, refreshToken } = this.generateTokens(savedUser);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
    await this.usersRepository.update(savedUser.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      user: savedUser,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: number) {
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  private generateTokens(user: Users) {
    const payload = { sub: user.id, username: user.username, role: user.role };

    const accessToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: Users) {
    const payload = { sub: user.id, username: user.username, role: user.role };

    const accessToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });

    return accessToken;
  }
}
