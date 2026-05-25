import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCompanyAddressDto } from './dto/update-company-address.dto';
import { FirebaseService } from '@/firebase/firebase.service';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async getCompanyProfile(firebaseUid: string) {
    const company = await this.prisma.companies.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
      include: {
        auth_account: {
          select: {
            email: true,
            is_active: true,
            created_at: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateCompanyProfile(
    firebaseUid: string,
    data: UpdateCompanyProfileDto,
  ) {
    const company = await this.prisma.companies.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (data.email || data.name_company) {
      await this.firebaseService.updateUserProfile(firebaseUid, data);
    }

    return this.prisma.companies.update({
      where: { id: company.id },
      data,
      include: {
        auth_account: {
          select: {
            email: true,
            is_active: true,
            created_at: true,
          },
        },
      },
    });
  }

  async updateCompanyAddress(
    firebaseUid: string,
    data: UpdateCompanyAddressDto,
  ) {
    const company = await this.prisma.companies.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.companies.update({
      where: { id: company.id },
      data,
      include: {
        auth_account: {
          select: {
            email: true,
            is_active: true,
            created_at: true,
          },
        },
      },
    });
  }
}
