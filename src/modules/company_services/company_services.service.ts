import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateCompanyServiceDto } from './dto/create-company-service.dto';
import { UpdateCompanyServiceDto } from './dto/update-company-service.dto';

@Injectable()
export class CompanyServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    firebaseUid: string,
    companyId: number,
    data: CreateCompanyServiceDto,
  ) {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.company_services.create({
      data: {
        company_id: companyId,
        name_service: data.name_service,
        description: data.description,
        base_price: data.base_price,
        estimated_duration: data.estimated_duration,
      },
    });
  }

  async findByCompanyId(firebaseUid: string, companyId: number) {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    return this.prisma.company_services.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findById(firebaseUid: string, companyId: number, serviceId: number) {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    const service = await this.prisma.company_services.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.company_id !== companyId) {
      throw new ForbiddenException(
        'This service does not belong to this company',
      );
    }

    return service;
  }

  async update(
    firebaseUid: string,
    companyId: number,
    serviceId: number,
    data: UpdateCompanyServiceDto,
  ) {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    const service = await this.prisma.company_services.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.company_id !== companyId) {
      throw new ForbiddenException(
        'This service does not belong to this company',
      );
    }

    return this.prisma.company_services.update({
      where: { id: serviceId },
      data: {
        name_service: data.name_service,
        description: data.description,
        base_price: data.base_price,
        estimated_duration: data.estimated_duration,
      },
    });
  }

  async remove(firebaseUid: string, companyId: number, serviceId: number) {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    const service = await this.prisma.company_services.findUnique({
      where: { id: serviceId },
      include: {
        service_requests: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.company_id !== companyId) {
      throw new ForbiddenException(
        'This service does not belong to this company',
      );
    }

    if (service.service_requests.length > 0) {
      throw new BadRequestException(
        'Cannot delete service with active requests',
      );
    }

    return this.prisma.company_services.delete({
      where: { id: serviceId },
    });
  }

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
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this company');
    }

    return { user, membership };
  }
}
