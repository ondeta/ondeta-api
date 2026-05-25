import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCompanyAddressDto } from './dto/update-company-address.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { UpdatePasswordDto } from '../auth/dto/update-password.dto';
import { AuthService } from '../auth/auth.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
  ) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async profile(@IdToken() token: string) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);

    const dbData = await this.companiesService.getCompanyProfile(
      firebaseData.uid,
    );

    return {
      firebase: firebaseData,
      profile: dbData,
    };
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateProfile(
    @IdToken() token: string,
    @Body() updateProfileDto: UpdateCompanyProfileDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.companiesService.updateCompanyProfile(
      firebaseData.uid,
      updateProfileDto,
    );
  }

  @Patch('address')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateAddress(
    @IdToken() token: string,
    @Body() updateAddressDto: UpdateCompanyAddressDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.companiesService.updateCompanyAddress(
      firebaseData.uid,
      updateAddressDto,
    );
  }

  @Patch('password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updatePassword(
    @IdToken() token: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    const companyProfile = await this.companiesService.getCompanyProfile(
      firebaseData.uid,
    );

    if (dto.new_password !== dto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    return await this.authService.updatePassword(
      firebaseData.uid,
      companyProfile.auth_account.email,
      dto.current_password,
      dto.new_password,
    );
  }
}
