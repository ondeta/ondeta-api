import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VehicleLocationsService } from './vehicle-locations.service';
import { StatusServiceRequest } from '@/shared/enums';
import {
  createCacheMock,
  createPrismaMock,
  provideCache,
  providePrisma,
} from '@/test/mocks';

describe('VehicleLocationsService', () => {
  let service: VehicleLocationsService;
  const prisma = createPrismaMock();
  const cache = createCacheMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleLocationsService,
        providePrisma(prisma),
        provideCache(cache),
      ],
    }).compile();

    service = module.get<VehicleLocationsService>(VehicleLocationsService);
    jest.clearAllMocks();
  });

  describe('reportLocation', () => {
    const dto = { latitude: -23.5, longitude: -46.6 };

    it('registra localização e atualiza cache', async () => {
      prisma.vehicles.findUnique.mockResolvedValue({ id: 1 });
      prisma.service_requests.findFirst.mockResolvedValue({
        id: 10,
        status: StatusServiceRequest.EmRota,
      });
      prisma.vehicle_locations.create.mockResolvedValue({
        id: 1,
        vehicle_id: 1,
        service_request_id: 10,
        latitude: dto.latitude,
        longitude: dto.longitude,
        created_at: new Date('2026-01-01T12:00:00Z'),
      });

      const result = await service.reportLocation('device-1', dto);

      expect(result.latitude).toBe(dto.latitude);
      expect(cache.set).toHaveBeenCalled();
    });

    it('lança NotFoundException quando dispositivo não existe', async () => {
      prisma.vehicles.findUnique.mockResolvedValue(null);

      await expect(service.reportLocation('unknown', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLatestByServiceRequest', () => {
    it('retorna localização do cache quando disponível', async () => {
      const cached = {
        id: 1,
        vehicle_id: 1,
        service_request_id: 10,
        latitude: -23.5,
        longitude: -46.6,
        created_at: new Date(),
      };

      prisma.service_requests.findUnique.mockResolvedValue({
        user_id: 1,
        company_id: 10,
      });
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      cache.get.mockResolvedValue(cached);

      await expect(service.getLatestByServiceRequest('uid', 10)).resolves.toEqual(
        cached,
      );
      expect(prisma.vehicle_locations.findFirst).not.toHaveBeenCalled();
    });

    it('lança ForbiddenException quando usuário não tem acesso', async () => {
      prisma.service_requests.findUnique.mockResolvedValue({
        user_id: 99,
        company_id: 10,
      });
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.memberships.findUnique.mockResolvedValue(null);

      await expect(
        service.getLatestByServiceRequest('uid', 10),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findHistoryByServiceRequest', () => {
    it('limita histórico entre 1 e 500 registros', async () => {
      prisma.service_requests.findUnique.mockResolvedValue({
        user_id: 1,
        company_id: 10,
      });
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.vehicle_locations.findMany.mockResolvedValue([]);

      await service.findHistoryByServiceRequest('uid', 10, 1000);

      expect(prisma.vehicle_locations.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 500 }),
      );
    });
  });
});
