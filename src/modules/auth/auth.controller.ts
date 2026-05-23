import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { IdToken } from './id-token.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/user')
  @HttpCode(201)
  async registerUser(@Body() dto: RegisterUserDto) {
    return await this.authService.registerUser(dto);
  }

  @Post('register/company')
  @HttpCode(201)
  async registerCompany(@Body() dto: RegisterCompanyDto) {
    return await this.authService.registerCompany(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logout(@IdToken() token: string) {
    return await this.authService.logout(token);
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshAuth(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto.refreshToken);
  }
}
