import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '@/database/prisma/prisma.service';
import { DemandAnalyticsQueryDto } from './dto/demand-analytics-query.dto';
import {
  DemandAnalyticsResponseDto,
  DemandByHourDto,
  DemandByNeighborhoodDto,
  DemandByServiceDto,
  DemandMapPointDto,
} from './dto/demand-analytics-response.dto';

type DemandRequestRow = {
  neighborhood: string;
  latitude: Prisma.Decimal;
  longitude: Prisma.Decimal;
  company_service_id: number;
  created_at: Date;
  company_service: {
    name_service: string;
  };
};

@Injectable()
export class DemandAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDemand(
    firebaseUid: string,
    companyId: number,
    query: DemandAnalyticsQueryDto,
  ): Promise<DemandAnalyticsResponseDto> {
    await this.validateUserAccessToCompany(firebaseUid, companyId);

    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const requests = await this.prisma.service_requests.findMany({
      where: this.buildWhereClause(companyId, query),
      select: {
        neighborhood: true,
        latitude: true,
        longitude: true,
        company_service_id: true,
        created_at: true,
        company_service: {
          select: {
            name_service: true,
          },
        },
      },
    });

    return this.aggregateDemand(requests);
  }

  private buildWhereClause(
    companyId: number,
    query: DemandAnalyticsQueryDto,
  ): Prisma.service_requestsWhereInput {
    const where: Prisma.service_requestsWhereInput = {
      company_id: companyId,
    };

    if (query.serviceId) {
      where.company_service_id = query.serviceId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.created_at = {};

      if (query.from) {
        where.created_at.gte = new Date(query.from);
      }

      if (query.to) {
        const endDate = new Date(query.to);
        endDate.setHours(23, 59, 59, 999);
        where.created_at.lte = endDate;
      }
    }

    return where;
  }

  private aggregateDemand(
    requests: DemandRequestRow[],
  ): DemandAnalyticsResponseDto {
    const total = requests.length;

    const neighborhoodMap = new Map<
      string,
      { count: number; latSum: number; lngSum: number }
    >();
    const hourMap = new Map<number, number>();
    const serviceMap = new Map<number, { name: string; count: number }>();

    for (const request of requests) {
      const latitude = this.toNumber(request.latitude);
      const longitude = this.toNumber(request.longitude);

      const neighborhoodEntry = neighborhoodMap.get(request.neighborhood) ?? {
        count: 0,
        latSum: 0,
        lngSum: 0,
      };
      neighborhoodEntry.count += 1;
      neighborhoodEntry.latSum += latitude;
      neighborhoodEntry.lngSum += longitude;
      neighborhoodMap.set(request.neighborhood, neighborhoodEntry);

      const hour = request.created_at.getHours();
      hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);

      const serviceEntry = serviceMap.get(request.company_service_id) ?? {
        name: request.company_service.name_service,
        count: 0,
      };
      serviceEntry.count += 1;
      serviceMap.set(request.company_service_id, serviceEntry);
    }

    const by_neighborhood: DemandByNeighborhoodDto[] = Array.from(
      neighborhoodMap.entries(),
    )
      .map(([neighborhood, data]) => ({
        neighborhood,
        count: data.count,
        percentage: this.toPercentage(data.count, total),
        latitude: data.latSum / data.count,
        longitude: data.lngSum / data.count,
      }))
      .sort((left, right) => right.count - left.count);

    const by_hour: DemandByHourDto[] = Array.from(hourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((left, right) => left.hour - right.hour);

    const by_service: DemandByServiceDto[] = Array.from(serviceMap.entries())
      .map(([service_id, data]) => ({
        service_id,
        name: data.name,
        count: data.count,
        percentage: this.toPercentage(data.count, total),
      }))
      .sort((left, right) => right.count - left.count);

    const points: DemandMapPointDto[] = by_neighborhood.map((item) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      weight: item.count,
      neighborhood: item.neighborhood,
    }));

    return {
      total,
      by_neighborhood,
      by_hour,
      by_service,
      points,
    };
  }

  private toPercentage(count: number, total: number): number {
    if (total === 0) {
      return 0;
    }

    return Math.round((count / total) * 1000) / 10;
  }

  private toNumber(value: Prisma.Decimal | number): number {
    return typeof value === 'number' ? value : Number(value);
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
      const company = await this.prisma.companies.findUnique({
        where: { id: companyId },
        select: { owner_user_id: true },
      });

      if (!company || company.owner_user_id !== user.id) {
        throw new ForbiddenException('You do not have access to this company');
      }
    }

    return user;
  }
}
