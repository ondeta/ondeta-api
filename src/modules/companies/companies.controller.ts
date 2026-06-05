import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateCompanyAddressDto } from './dto/update-company-address.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { UpdatePasswordDto } from '../auth/dto/update-password.dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '@/database/prisma/prisma.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
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

  @Post('transfer-ownership')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async transferOwnership(
    @IdToken() token: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.companiesService.transferOwnership(firebaseData.uid, dto);
  }

  @Delete()
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async deleteCompany(@IdToken() token: string) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.companiesService.deleteCompany(firebaseData.uid);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all registered companies with their services',
  })
  findAll() {
    return this.companiesService.findAllCatalog();
  }

  @Get(':companyId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of a registered company' })
  findOne(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.companiesService.findOneCatalog(companyId);
  }
}
