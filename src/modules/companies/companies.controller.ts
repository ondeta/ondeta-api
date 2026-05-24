import { Controller, Get, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly firebaseService: FirebaseService,
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
}
