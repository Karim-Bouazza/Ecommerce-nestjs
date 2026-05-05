import {
  Controller,
  Post,
  Body,
  SerializeOptions,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginAuthenticationDto } from './dto/login-authentication.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { RegisterAuthenticationDto } from './dto/register-authentication.dto';
import type { Request, Response } from 'express';
import { RegisterResponseDto } from './dto/register-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  async login(
    @Body() loginAuthenticationDto: LoginAuthenticationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authenticationService.login(loginAuthenticationDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return new ApiResponseDto({ accessToken }, 'Login successful');
  }

  @Post('register')
  @SerializeOptions({ strategy: 'excludeAll' })
  async register(
    @Body() registerAuthenticationDto: RegisterAuthenticationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authenticationService.register(registerAuthenticationDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return new ApiResponseDto(
      new RegisterResponseDto({ ...user, accessToken }),
      'Registration successful',
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const user = (req as any).user;

    await this.authenticationService.logout(user.userId);

    res.clearCookie('refreshToken');

    return new ApiResponseDto(null, 'Logout successful');
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken } =
      await this.authenticationService.refreshToken(refreshToken);
    return new ApiResponseDto({ accessToken }, 'Token refreshed successfully');
  }
}
