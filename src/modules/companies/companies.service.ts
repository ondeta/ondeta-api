import { PrismaService } from '@/database/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateCompanyAddressDto } from './dto/update-company-address.dto';
import { FirebaseService } from '@/firebase/firebase.service';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { Roles } from '@/shared/enums';

const publicCompanySelect = {
  id: true,
  name_company: true,
  description: true,
  phone_number: true,
  country: true,
  state: true,
  city: true,
  neighborhood: true,
  street: true,
  number: true,
  zip_code: true,
  latitude: true,
  longitude: true,
  created_at: true,
  company_services: {
    select: {
      id: true,
      name_service: true,
      description: true,
      base_price: true,
      estimated_duration: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc' as const,
    },
  },
};

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async findAllCatalog() {
    return this.prisma.companies.findMany({
      select: publicCompanySelect,
      orderBy: {
        name_company: 'asc',
      },
    });
  }

  async findOneCatalog(companyId: number) {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      select: publicCompanySelect,
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async getCompanyProfile(firebaseUid: string) {
    const user = await this.prisma.users.findFirst({
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
        owned_company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = await this.prisma.companies.findUnique({
      where: { owner_user_id: user.id },
      include: {
        owner_user: {
          select: {
            id: true,
            full_name: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('User does not own a company');
    }

    return {
      company,
      user_email: user.auth_account.email,
      is_active: user.auth_account.is_active,
    };
  }

  async updateCompanyProfile(
    firebaseUid: string,
    data: UpdateCompanyProfileDto,
  ) {
    const user = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = await this.prisma.companies.findUnique({
      where: { owner_user_id: user.id },
    });

    if (!company) {
      throw new ForbiddenException('User does not own a company');
    }

    if (data.email || data.name_company) {
      await this.firebaseService.updateUserProfile(firebaseUid, data);
    }

    return this.prisma.companies.update({
      where: { id: company.id },
      data,
      include: {
        owner_user: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
  }

  async updateCompanyAddress(
    firebaseUid: string,
    data: UpdateCompanyAddressDto,
  ) {
    const user = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = await this.prisma.companies.findUnique({
      where: { owner_user_id: user.id },
    });

    if (!company) {
      throw new ForbiddenException('User does not own a company');
    }

    return this.prisma.companies.update({
      where: { id: company.id },
      data,
      include: {
        owner_user: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
  }

  async transferOwnership(firebaseUid: string, dto: TransferOwnershipDto) {
    const currentUser = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
      include: {
        auth_account: {
          select: {
            firebase_uid: true,
          },
        },
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const company = await this.prisma.companies.findUnique({
      where: { owner_user_id: currentUser.id },
    });

    if (!company) {
      throw new ForbiddenException('User does not own a company');
    }

    const newOwner = await this.prisma.users.findUnique({
      where: { id: dto.new_owner_user_id },
      include: {
        auth_account: {
          select: {
            firebase_uid: true,
          },
        },
      },
    });

    if (!newOwner) {
      throw new NotFoundException('New owner user not found');
    }

    // Verificar se novo owner é membro da empresa
    const membership = await this.prisma.memberships.findUnique({
      where: {
        user_id_company_id: {
          user_id: newOwner.id,
          company_id: company.id,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException(
        'New owner must be a member of the company',
      );
    }

    // Atualizar ownership
    const result = await this.prisma.$transaction(async (tx) => {
      // Atualizar membership do novo owner para owner
      await tx.memberships.update({
        where: {
          user_id_company_id: {
            user_id: newOwner.id,
            company_id: company.id,
          },
        },
        data: {
          role: Roles.Owner,
        },
      });

      // Transferir company ownership
      const updatedCompany = await tx.companies.update({
        where: { id: company.id },
        data: {
          owner_user_id: newOwner.id,
        },
      });

      // Atualizar membership do owner anterior para membro comum ou admin
      const currentOwnerMembership = await tx.memberships.findUnique({
        where: {
          user_id_company_id: {
            user_id: currentUser.id,
            company_id: company.id,
          },
        },
      });

      if (currentOwnerMembership) {
        await tx.memberships.update({
          where: {
            user_id_company_id: {
              user_id: currentUser.id,
              company_id: company.id,
            },
          },
          data: {
            role: Roles.Admin,
          },
        });
      }

      return {
        message: 'Ownership transferred successfully',
        data: {
          company: updatedCompany,
          previous_owner: currentUser.id,
          new_owner: newOwner.id,
        },
      };
    });

    // Atualizar account_type no Firebase
    if (currentUser.auth_account?.firebase_uid) {
      await this.firebaseService.setCustomUserClaims(
        currentUser.auth_account.firebase_uid,
        { account_type: 'user' },
      );
    }

    if (newOwner.auth_account?.firebase_uid) {
      await this.firebaseService.setCustomUserClaims(
        newOwner.auth_account.firebase_uid,
        { account_type: 'company' },
      );
    }

    return result;
  }

  async deleteCompany(firebaseUid: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
      include: {
        auth_account: {
          select: {
            firebase_uid: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = await this.prisma.companies.findUnique({
      where: { owner_user_id: user.id },
    });

    if (!company) {
      throw new ForbiddenException('User does not own a company');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Deletar todos os memberships da empresa
      await tx.memberships.deleteMany({
        where: { company_id: company.id },
      });

      // Deletar todos os serviços da empresa
      await tx.company_services.deleteMany({
        where: { company_id: company.id },
      });

      // Deletar todos os veículos da empresa
      await tx.vehicles.deleteMany({
        where: { company_id: company.id },
      });

      // Deletar empresa
      const deletedCompany = await tx.companies.delete({
        where: { id: company.id },
      });

      return {
        message: 'Company deleted successfully',
        data: deletedCompany,
      };
    });

    // Atualizar account_type no Firebase para 'user'
    if (user.auth_account?.firebase_uid) {
      await this.firebaseService.setCustomUserClaims(
        user.auth_account.firebase_uid,
        { account_type: 'user' },
      );
    }

    return result;
  }
}
