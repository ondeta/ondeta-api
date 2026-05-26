import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
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

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async profile(@IdToken() token: string) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);

    const dbData = await this.usersService.getUserProfile(firebaseData.uid);

    return {
      firebase: firebaseData,
      profile: dbData,
    };
  }
}
