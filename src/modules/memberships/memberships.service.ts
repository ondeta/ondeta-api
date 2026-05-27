/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipRoleDto } from './dto/update-membership-role.dto';
import { Roles } from '@/shared/enums';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateUserAccessToCompany(
    firebaseUid: string,
    companyId: number,
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

    const membership = await this.prisma.memberships.findUnique({
      where: {
        user_id_company_id: {
          user_id: user.id,
          company_id: companyId,
        },
      },
      include: {
        company: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this company');
    }

    return { user, membership };
  }

  private async validateUserIsAdminOrOwner(
    firebaseUid: string,
    companyId: number,
  ) {
    const { user, membership } = await this.validateUserAccessToCompany(
      firebaseUid,
      companyId,
    );

    if (membership.role !== Roles.Admin && membership.role !== Roles.Owner) {
      throw new ForbiddenException(
        'Only admin or owner can perform this action',
      );
    }

    return { user, membership };
  }

  async create(
    firebaseUid: string,
    companyId: number,
    data: CreateMembershipDto,
  ) {
    // Validar se companyId do body corresponde com o da URL
    if (data.company_id !== companyId) {
      throw new BadRequestException('Company ID in body does not match URL');
    }

    // Validar se o usuário é admin/owner da empresa
    await this.validateUserIsAdminOrOwner(firebaseUid, companyId);

    const user = await this.prisma.users.findUnique({
      where: { id: data.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existingMembership = await this.prisma.memberships.findUnique({
      where: {
        user_id_company_id: {
          user_id: data.user_id,
          company_id: data.company_id,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this company');
    }

    return this.prisma.memberships.create({
      data,
      include: {
        user: true,
        company: true,
      },
    });
  }

  async findById(firebaseUid: string, companyId: number, memberId: number) {
    const membership = await this.prisma.memberships.findUnique({
      where: { id: memberId },
      include: {
        user: true,
        company: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Validar se o membership pertence à empresa
    if (membership.company_id !== companyId) {
      throw new ForbiddenException(
        'Membership does not belong to this company',
      );
    }

    // Validar se o usuário tem acesso a essa empresa
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    return membership;
  }

  async findByCompanyId(firebaseUid: string, company_id: number) {
    // Validar se o usuário tem acesso a essa empresa
    await this.validateUserAccessToCompany(firebaseUid, company_id);

    const company = await this.prisma.companies.findUnique({
      where: { id: company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.memberships.findMany({
      where: { company_id },
      include: {
        user: true,
        company: true,
      },
    });
  }

  async findByUserId(firebaseUid: string, user_id: number) {
    const requestingUser = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
    });

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    // Usuário só pode ver seus próprios memberships ou se for admin/owner de uma empresa
    if (requestingUser.id !== user_id) {
      throw new ForbiddenException('You can only view your own memberships');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.memberships.findMany({
      where: { user_id },
      include: {
        user: true,
        company: true,
      },
    });
  }

  async updateRole(
    firebaseUid: string,
    companyId: number,
    memberId: number,
    data: UpdateMembershipRoleDto,
  ) {
    const membership = await this.prisma.memberships.findUnique({
      where: { id: memberId },
      include: {
        company: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Validar se o membership pertence à empresa
    if (membership.company_id !== companyId) {
      throw new ForbiddenException(
        'Membership does not belong to this company',
      );
    }

    // Validar se o usuário é admin/owner da empresa
    await this.validateUserIsAdminOrOwner(firebaseUid, companyId);

    // Impedir que o owner altere sua própria role
    if (
      membership.user_id === membership.company.owner_user_id &&
      membership.role === Roles.Owner
    ) {
      throw new ForbiddenException(
        'Owner cannot change their own role. Use transfer-ownership endpoint instead.',
      );
    }

    return this.prisma.memberships.update({
      where: { id: memberId },
      data,
      include: {
        user: true,
        company: true,
      },
    });
  }

  async remove(firebaseUid: string, companyId: number, memberId: number) {
    const membership = await this.prisma.memberships.findUnique({
      where: { id: memberId },
      include: {
        company: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Validar se o membership pertence à empresa
    if (membership.company_id !== companyId) {
      throw new ForbiddenException(
        'Membership does not belong to this company',
      );
    }

    // Validar se o usuário é admin/owner da empresa
    await this.validateUserIsAdminOrOwner(firebaseUid, companyId);

    // Impedir que o owner delete a si mesmo
    if (
      membership.user_id === membership.company.owner_user_id &&
      membership.role === Roles.Owner
    ) {
      throw new ForbiddenException(
        'Owner cannot be removed from company. Use transfer-ownership endpoint instead.',
      );
    }

    return this.prisma.memberships.delete({
      where: { id: memberId },
      include: {
        user: true,
        company: true,
      },
    });
  }
}
