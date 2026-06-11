import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PrismaService } from '@/database/prisma/prisma.service';
import { StatusServiceRequest } from '@/shared/enums';
import { CreateVehicleLocationDto } from './dto/create-vehicle-location.dto';
import { VehicleLocationResponseDto } from './dto/vehicle-location-response.dto';
import {
  vehicleLocationLatestCacheKey,
  VEHICLE_LOCATION_CACHE_TTL_MS,
} from '@/shared/constants/cache-keys';
import { VEHICLE_TRACKABLE_STATUSES } from '@/shared/constants/service-request-statuses';

const TRACKABLE_STATUSES = VEHICLE_TRACKABLE_STATUSES;

@Injectable()
export class VehicleLocationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async reportLocation(
    deviceIdentifier: string,
    data: CreateVehicleLocationDto,
  ): Promise<VehicleLocationResponseDto> {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { device_identifier: deviceIdentifier },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle device not found');
    }

    const serviceRequest = await this.resolveServiceRequest(
      vehicle.id,
      data.service_request_id,
    );

    const location = await this.prisma.vehicle_locations.create({
      data: {
        vehicle_id: vehicle.id,
        service_request_id: serviceRequest.id,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    const response = this.toResponse(location);
    await this.cacheManager.set(
      vehicleLocationLatestCacheKey(serviceRequest.id),
      response,
      VEHICLE_LOCATION_CACHE_TTL_MS,
    );

    return response;
  }

  async getLatestByServiceRequest(
    firebaseUid: string,
    serviceRequestId: number,
  ): Promise<VehicleLocationResponseDto> {
    await this.validateServiceRequestAccess(firebaseUid, serviceRequestId);

    const cacheKey = vehicleLocationLatestCacheKey(serviceRequestId);
    const cached =
      await this.cacheManager.get<VehicleLocationResponseDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const location = await this.prisma.vehicle_locations.findFirst({
      where: { service_request_id: serviceRequestId },
      orderBy: { created_at: 'desc' },
    });

    if (!location) {
      throw new NotFoundException(
        'No location recorded for this service request',
      );
    }

    const response = this.toResponse(location);
    await this.cacheManager.set(
      cacheKey,
      response,
      VEHICLE_LOCATION_CACHE_TTL_MS,
    );

    return response;
  }

  async findHistoryByServiceRequest(
    firebaseUid: string,
    serviceRequestId: number,
    limit = 100,
  ): Promise<VehicleLocationResponseDto[]> {
    await this.validateServiceRequestAccess(firebaseUid, serviceRequestId);

    const safeLimit = Math.min(Math.max(limit, 1), 500);

    const locations = await this.prisma.vehicle_locations.findMany({
      where: { service_request_id: serviceRequestId },
      orderBy: { created_at: 'desc' },
      take: safeLimit,
    });

    return locations.map((location) => this.toResponse(location));
  }

  private async resolveServiceRequest(
    vehicleId: number,
    serviceRequestId?: number,
  ) {
    if (serviceRequestId !== undefined) {
      const request = await this.prisma.service_requests.findUnique({
        where: { id: serviceRequestId },
      });

      if (!request) {
        throw new NotFoundException('Service request not found');
      }

      if (request.vehicle_id !== vehicleId) {
        throw new ForbiddenException(
          'This service request is not assigned to your vehicle',
        );
      }

      this.assertTrackableStatus(request.status as StatusServiceRequest);

      return request;
    }

    const activeRequest = await this.prisma.service_requests.findFirst({
      where: {
        vehicle_id: vehicleId,
        status: { in: TRACKABLE_STATUSES },
      },
      orderBy: { updated_at: 'desc' },
    });

    if (!activeRequest) {
      throw new BadRequestException(
        'No in-route service request found for this vehicle. Start the route from the device or provide service_request_id.',
      );
    }

    return activeRequest;
  }

  private assertTrackableStatus(status: StatusServiceRequest) {
    if (!TRACKABLE_STATUSES.includes(status)) {
      throw new BadRequestException(
        'Location can only be reported while the service request is in route',
      );
    }
  }

  private async validateServiceRequestAccess(
    firebaseUid: string,
    serviceRequestId: number,
  ) {
    const request = await this.prisma.service_requests.findUnique({
      where: { id: serviceRequestId },
      select: { user_id: true, company_id: true },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

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

    if (request.user_id === user.id) {
      return;
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
      throw new ForbiddenException(
        'You do not have access to this service request',
      );
    }
  }

  private toResponse(location: {
    id: number;
    vehicle_id: number;
    service_request_id: number;
    latitude: { toNumber(): number } | number | string;
    longitude: { toNumber(): number } | number | string;
    created_at: Date;
  }): VehicleLocationResponseDto {
    return {
      id: location.id,
      vehicle_id: location.vehicle_id,
      service_request_id: location.service_request_id,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      created_at: location.created_at,
    };
  }
}
