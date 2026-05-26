import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConvertToCompanyDto } from './dto/convert-to-company.dto';
import { IdToken } from './id-token.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(FirebaseService) private readonly firebaseService: FirebaseService,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterUserDto) {
    return await this.authService.registerUser(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('convert-to-company')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async convertToCompany(
    @IdToken() token: string,
    @Body() dto: ConvertToCompanyDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return await this.authService.convertToCompany(firebaseData.uid, dto);
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
