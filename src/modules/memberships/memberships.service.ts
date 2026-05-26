/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipRoleDto } from './dto/update-membership-role.dto';
import { Roles } from '@/shared/enums';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMembershipDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: data.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = await this.prisma.companies.findUnique({
      where: { id: data.company_id },
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

  async findById(id: number) {
    const membership = await this.prisma.memberships.findUnique({
      where: { id },
      include: {
        user: true,
        company: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return membership;
  }

  async findByCompanyId(company_id: number) {
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

  async findByUserId(user_id: number) {
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

  async updateRole(id: number, data: UpdateMembershipRoleDto) {
    const membership = await this.findById(id);

    // Verificar se é o owner da empresa
    const company = await this.prisma.companies.findUnique({
      where: { id: membership.company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Impedir que o owner altere sua própria role
    if (
      membership.user_id === company.owner_user_id &&
      membership.role === Roles.Owner
    ) {
      throw new ForbiddenException(
        'Owner cannot change their own role. Use transfer-ownership endpoint instead.',
      );
    }

    return this.prisma.memberships.update({
      where: { id },
      data,
      include: {
        user: true,
        company: true,
      },
    });
  }

  async remove(id: number) {
    const membership = await this.findById(id);

    // Verificar se é o owner da empresa
    const company = await this.prisma.companies.findUnique({
      where: { id: membership.company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Impedir que o owner delete a si mesmo
    if (
      membership.user_id === company.owner_user_id &&
      membership.role === Roles.Owner
    ) {
      throw new ForbiddenException(
        'Owner cannot be removed from company. Use transfer-ownership endpoint instead.',
      );
    }

    return this.prisma.memberships.delete({
      where: { id },
      include: {
        user: true,
        company: true,
      },
    });
  }
}
