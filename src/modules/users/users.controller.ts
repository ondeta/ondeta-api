import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { FirebaseService } from '@/firebase/firebase.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdToken } from '../auth/id-token.decorator';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post('register')
  async registerUser(@Body() dto: RegisterUserDto) {
    return await this.usersService.registerUser(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async profile(@IdToken() token: string) {
    return await this.firebaseService.verifyIdToken(token);
  }
}
