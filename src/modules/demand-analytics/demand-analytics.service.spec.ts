import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DemandAnalyticsService } from './demand-analytics.service';
import { createPrismaMock, providePrisma } from '@/test/mocks';

describe('DemandAnalyticsService', () => {
  let service: DemandAnalyticsService;
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemandAnalyticsService, providePrisma(prisma)],
    }).compile();

    service = module.get<DemandAnalyticsService>(DemandAnalyticsService);
    jest.clearAllMocks();
  });

  const mockAccess = () => {
    prisma.users.findFirst.mockResolvedValue({ id: 1 });
    prisma.memberships.findUnique.mockResolvedValue({
      user_id: 1,
      company_id: 10,
    });
    prisma.companies.findUnique.mockResolvedValue({ id: 10 });
  };

  describe('getDemand', () => {
    it('agrega demanda por bairro, hora e serviço', async () => {
      mockAccess();
      prisma.service_requests.findMany.mockResolvedValue([
        {
          neighborhood: 'Centro',
          latitude: -23.5,
          longitude: -46.6,
          company_service_id: 1,
          created_at: new Date('2026-01-01T10:00:00Z'),
          company_service: { name_service: 'Limpeza' },
        },
        {
          neighborhood: 'Centro',
          latitude: -23.5,
          longitude: -46.6,
          company_service_id: 1,
          created_at: new Date('2026-01-01T14:00:00Z'),
          company_service: { name_service: 'Limpeza' },
        },
      ]);

      const result = await service.getDemand('uid', 10, {});

      expect(result.total).toBe(2);
      expect(result.by_neighborhood).toHaveLength(1);
      expect(result.by_neighborhood[0].neighborhood).toBe('Centro');
      expect(result.by_neighborhood[0].count).toBe(2);
      expect(result.by_service[0].count).toBe(2);
    });

    it('retorna estrutura vazia quando não há solicitações', async () => {
      mockAccess();
      prisma.service_requests.findMany.mockResolvedValue([]);

      const result = await service.getDemand('uid', 10, {});

      expect(result.total).toBe(0);
      expect(result.by_neighborhood).toEqual([]);
      expect(result.by_hour).toEqual([]);
      expect(result.by_service).toEqual([]);
    });

    it('lança NotFoundException quando empresa não existe', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.memberships.findUnique.mockResolvedValue({
        user_id: 1,
        company_id: 10,
      });
      prisma.companies.findUnique.mockResolvedValue(null);

      await expect(service.getDemand('uid', 10, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permite acesso ao owner mesmo sem membership', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.memberships.findUnique.mockResolvedValue(null);
      prisma.companies.findUnique
        .mockResolvedValueOnce({ id: 10, owner_user_id: 1 })
        .mockResolvedValueOnce({ id: 10 });
      prisma.service_requests.findMany.mockResolvedValue([]);

      await expect(service.getDemand('uid', 10, {})).resolves.toMatchObject({
        total: 0,
      });
    });

    it('lança ForbiddenException sem membership nem ownership', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.memberships.findUnique.mockResolvedValue(null);
      prisma.companies.findUnique.mockResolvedValue({
        id: 10,
        owner_user_id: 99,
      });

      await expect(service.getDemand('uid', 10, {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
