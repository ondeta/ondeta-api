import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { MembershipsService } from '../memberships/memberships.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IdToken } from '../auth/id-token.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdatePasswordDto } from '../auth/dto/update-password.dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '@/database/prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
    private readonly membershipsService: MembershipsService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
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

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated user profile' })
  async updateProfile(
    @IdToken() token: string,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    const profile = await this.usersService.updateUserProfile(
      firebaseData.uid,
      updateProfileDto,
    );

    return {
      firebase: firebaseData,
      profile,
    };
  }

  @Patch('password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated user password' })
  async updatePassword(
    @IdToken() token: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    const user = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseData.uid,
        },
      },
      include: {
        auth_account: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!user?.auth_account?.email) {
      throw new BadRequestException('User not found');
    }

    if (dto.new_password !== dto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    return await this.authService.updatePassword(
      firebaseData.uid,
      user.auth_account.email,
      dto.current_password,
      dto.new_password,
    );
  }

  @Get(':userId/memberships')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getMemberships(
    @IdToken() token: string,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.membershipsService.findByUserId(firebaseData.uid, userId);
  }
}
