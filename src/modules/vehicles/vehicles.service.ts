import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(firebaseUid: string, companyId: number, data: CreateVehicleDto) {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    const existingPlate = await this.prisma.vehicles.findUnique({
      where: { plate: data.plate },
    });

    if (existingPlate) {
      throw new ConflictException('Vehicle plate already registered');
    }

    const existingDevice = await this.prisma.vehicles.findUnique({
      where: { device_identifier: data.device_identifier },
    });

    if (existingDevice) {
      throw new ConflictException('Device identifier already registered');
    }

    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.vehicles.create({
      data: {
        company_id: companyId,
        name_vehicle: data.name_vehicle,
        plate: data.plate,
        device_identifier: data.device_identifier,
      },
    });
  }

  async findById(firebaseUid: string, vehicleId: number) {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id: vehicleId },
      include: {
        company: {
          select: {
            id: true,
            name_company: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.validateUserAccessToCompany(firebaseUid, vehicle.company_id);

    return vehicle;
  }

  async findByCompanyId(firebaseUid: string, companyId: number) {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    return this.prisma.vehicles.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async update(firebaseUid: string, vehicleId: number, data: UpdateVehicleDto) {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.validateUserAccessToCompany(firebaseUid, vehicle.company_id);

    if (data.plate && data.plate !== vehicle.plate) {
      const existingPlate = await this.prisma.vehicles.findUnique({
        where: { plate: data.plate },
      });

      if (existingPlate) {
        throw new ConflictException('Vehicle plate already registered');
      }
    }

    if (
      data.device_identifier &&
      data.device_identifier !== vehicle.device_identifier
    ) {
      const existingDevice = await this.prisma.vehicles.findUnique({
        where: { device_identifier: data.device_identifier },
      });

      if (existingDevice) {
        throw new ConflictException('Device identifier already registered');
      }
    }

    return this.prisma.vehicles.update({
      where: { id: vehicleId },
      data: {
        name_vehicle: data.name_vehicle || vehicle.name_vehicle,
        plate: data.plate || vehicle.plate,
        device_identifier: data.device_identifier || vehicle.device_identifier,
      },
    });
  }

  async delete(firebaseUid: string, vehicleId: number) {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.validateUserAccessToCompany(firebaseUid, vehicle.company_id);

    return this.prisma.vehicles.delete({
      where: { id: vehicleId },
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
      include: {
        company: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this company');
    }

    return { user, membership };
  }
}
