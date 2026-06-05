/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { AcceptServiceRequestDto } from './dto/accept-service-request.dto';
import { Roles } from '@/shared/enums';
import { StatusServiceRequest } from '@/shared/enums';

@Injectable()
export class ServiceRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    firebaseUid: string,
    companyId: number,
    data: CreateServiceRequestDto,
  ) {
    const user = await this.getUserByFirebaseUid(firebaseUid);

    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const companyService = await this.prisma.company_services.findUnique({
      where: { id: data.company_service_id },
    });

    if (!companyService) {
      throw new NotFoundException('Company service not found');
    }

    if (companyService.company_id !== companyId) {
      throw new ForbiddenException(
        'This service does not belong to this company',
      );
    }

    return this.prisma.service_requests.create({
      data: {
        user_id: user.id,
        company_id: companyId,
        company_service_id: data.company_service_id,
        status: StatusServiceRequest.Pendente,
        notes: data.notes,
        requested_date: data.requested_date
          ? new Date(data.requested_date)
          : undefined,
        country: data.country,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood,
        street: data.street,
        number: data.number,
        zip_code: data.zip_code,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: this.defaultInclude(),
    });
  }

  async findByUser(firebaseUid: string) {
    const user = await this.getUserByFirebaseUid(firebaseUid);

    return this.prisma.service_requests.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      include: this.defaultInclude(),
    });
  }

  async findByCompany(firebaseUid: string, companyId: number) {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    return this.prisma.service_requests.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      include: this.defaultInclude(),
    });
  }

  async findById(firebaseUid: string, requestId: number) {
    const request = await this.getRequestOrThrow(requestId);
    await this.validateRequestAccess(firebaseUid, request);
    return request;
  }

  async updateByUser(
    firebaseUid: string,
    requestId: number,
    data: UpdateServiceRequestDto,
  ) {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    const request = await this.getRequestOrThrow(requestId);

    if (request.user_id !== user.id) {
      throw new ForbiddenException('You can only update your own requests');
    }

    if (request.status !== StatusServiceRequest.Pendente) {
      throw new BadRequestException(
        'Only pending requests can be updated by the user',
      );
    }

    return this.prisma.service_requests.update({
      where: { id: requestId },
      data: {
        notes: data.notes ?? request.notes,
        requested_date: data.requested_date
          ? new Date(data.requested_date)
          : request.requested_date,
        country: data.country ?? request.country,
        state: data.state ?? request.state,
        city: data.city ?? request.city,
        neighborhood: data.neighborhood ?? request.neighborhood,
        street: data.street ?? request.street,
        number: data.number ?? request.number,
        zip_code: data.zip_code ?? request.zip_code,
        latitude: data.latitude ?? request.latitude,
        longitude: data.longitude ?? request.longitude,
      },
      include: this.defaultInclude(),
    });
  }

  async cancelByUser(firebaseUid: string, requestId: number) {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    const request = await this.getRequestOrThrow(requestId);

    if (request.user_id !== user.id) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (request.status !== StatusServiceRequest.Pendente) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    return this.prisma.service_requests.update({
      where: { id: requestId },
      data: { status: StatusServiceRequest.Cancelado },
      include: this.defaultInclude(),
    });
  }

  async acceptByCompany(
    firebaseUid: string,
    companyId: number,
    requestId: number,
    data: AcceptServiceRequestDto,
  ) {
    await this.validateUserIsAdminOrOwner(firebaseUid, companyId);

    const request = await this.getRequestOrThrow(requestId);

    if (request.company_id !== companyId) {
      throw new ForbiddenException(
        'This request does not belong to this company',
      );
    }

    if (request.status !== StatusServiceRequest.Pendente) {
      throw new BadRequestException(
        'Only pending requests can be accepted by the company',
      );
    }

    const scheduledDate = new Date(data.scheduled_date);
    if (Number.isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid scheduled date');
    }

    if (scheduledDate.getTime() < Date.now()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    await this.validateVehicleForCompany(data.vehicle_id, companyId);

    return this.prisma.service_requests.update({
      where: { id: requestId },
      data: {
        status: StatusServiceRequest.Agendado,
        scheduled_date: scheduledDate,
        vehicle_id: data.vehicle_id,
      },
      include: this.defaultInclude(),
    });
  }

  async refuseByCompany(
    firebaseUid: string,
    companyId: number,
    requestId: number,
  ) {
    await this.validateUserIsAdminOrOwner(firebaseUid, companyId);

    const request = await this.getRequestOrThrow(requestId);

    if (request.company_id !== companyId) {
      throw new ForbiddenException(
        'This request does not belong to this company',
      );
    }

    if (request.status !== StatusServiceRequest.Pendente) {
      throw new BadRequestException(
        'Only pending requests can be refused by the company',
      );
    }

    return this.prisma.service_requests.update({
      where: { id: requestId },
      data: {
        status: StatusServiceRequest.Recusado,
      },
      include: this.defaultInclude(),
    });
  }

  private defaultInclude() {
    return {
      company_service: {
        select: {
          id: true,
          name_service: true,
          base_price: true,
          estimated_duration: true,
        },
      },
      company: {
        select: {
          id: true,
          name_company: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          name_vehicle: true,
          plate: true,
        },
      },
      user: {
        select: {
          id: true,
          full_name: true,
          phone_number: true,
        },
      },
    } as const;
  }

  private async getRequestOrThrow(requestId: number) {
    const request = await this.prisma.service_requests.findUnique({
      where: { id: requestId },
      include: this.defaultInclude(),
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    return request;
  }

  private async getUserByFirebaseUid(firebaseUid: string) {
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

    return user;
  }

  private async validateUserAccessToCompany(
    firebaseUid: string,
    companyId: number,
  ) {
    const user = await this.getUserByFirebaseUid(firebaseUid);

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

  private async validateRequestAccess(
    firebaseUid: string,
    request: { user_id: number; company_id: number },
  ) {
    const user = await this.getUserByFirebaseUid(firebaseUid);

    if (request.user_id === user.id) {
      return { user };
    }

    const membership = await this.prisma.memberships.findUnique({
      where: {
        user_id_company_id: {
          user_id: user.id,
          company_id: request.company_id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this request');
    }

    return { user, membership };
  }

  private async validateVehicleForCompany(
    vehicleId: number,
    companyId: number,
  ) {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.company_id !== companyId) {
      throw new ForbiddenException(
        'This vehicle does not belong to this company',
      );
    }
  }
}
