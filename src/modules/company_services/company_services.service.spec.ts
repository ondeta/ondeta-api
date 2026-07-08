import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CompanyServicesService } from './company_services.service';
import { createPrismaMock, providePrisma } from '@/test/mocks';

describe('CompanyServicesService', () => {
  let service: CompanyServicesService;
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyServicesService, providePrisma(prisma)],
    }).compile();

    service = module.get<CompanyServicesService>(CompanyServicesService);
    jest.clearAllMocks();
  });

  const mockAccess = () => {
    prisma.users.findFirst.mockResolvedValue({ id: 1 });
    prisma.memberships.findUnique.mockResolvedValue({
      user_id: 1,
      company_id: 10,
    });
  };

  describe('create', () => {
    it('cria serviço da empresa', async () => {
      mockAccess();
      prisma.companies.findUnique.mockResolvedValue({ id: 10 });
      prisma.company_services.create.mockResolvedValue({ id: 1 });

      const result = await service.create('uid', 10, {
        name_service: 'Limpeza',
        description: 'Desc',
        base_price: 100,
        estimated_duration: 60,
      });

      expect(result.id).toBe(1);
    });
  });

  describe('findOneCatalog', () => {
    it('lança NotFoundException quando serviço não pertence à empresa', async () => {
      prisma.companies.findUnique.mockResolvedValue({ id: 10 });
      prisma.company_services.findUnique.mockResolvedValue({
        id: 1,
        company_id: 99,
      });

      await expect(service.findOneCatalog(10, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('impede exclusão de serviço com solicitações ativas', async () => {
      mockAccess();
      prisma.company_services.findUnique.mockResolvedValue({
        id: 1,
        company_id: 10,
        service_requests: [{ id: 100 }],
      });

      await expect(service.remove('uid', 10, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('remove serviço sem solicitações', async () => {
      mockAccess();
      prisma.company_services.findUnique.mockResolvedValue({
        id: 1,
        company_id: 10,
        service_requests: [],
      });
      prisma.company_services.delete.mockResolvedValue({ id: 1 });

      await expect(service.remove('uid', 10, 1)).resolves.toEqual({ id: 1 });
    });

    it('lança ForbiddenException quando serviço é de outra empresa', async () => {
      mockAccess();
      prisma.company_services.findUnique.mockResolvedValue({
        id: 1,
        company_id: 99,
        service_requests: [],
      });

      await expect(service.remove('uid', 10, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
