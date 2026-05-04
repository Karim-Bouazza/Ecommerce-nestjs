import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('login')
  async login(@Body() createAuthenticationDto: CreateAuthenticationDto) {
    const result = await this.authenticationService.login(createAuthenticationDto);
    return new ApiResponseDto(result, "Login successful");
  }
}
