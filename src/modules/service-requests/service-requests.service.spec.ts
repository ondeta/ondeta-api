import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { Roles, StatusServiceRequest } from '@/shared/enums';
import { createPrismaMock, providePrisma } from '@/test/mocks';

describe('ServiceRequestsService', () => {
  let service: ServiceRequestsService;
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceRequestsService, providePrisma(prisma)],
    }).compile();

    service = module.get<ServiceRequestsService>(ServiceRequestsService);
    jest.clearAllMocks();
  });

  const mockUser = () => {
    prisma.users.findFirst.mockResolvedValue({ id: 1 });
  };

  const mockAdminAccess = () => {
    prisma.users.findFirst.mockResolvedValue({ id: 2 });
    prisma.memberships.findUnique.mockResolvedValueOnce({
      user_id: 2,
      company_id: 10,
      role: Roles.Owner,
    });
  };

  describe('create', () => {
    it('cria solicitação pendente', async () => {
      mockUser();
      prisma.companies.findUnique.mockResolvedValue({ id: 10 });
      prisma.company_services.findUnique.mockResolvedValue({
        id: 5,
        company_id: 10,
      });
      prisma.service_requests.create.mockResolvedValue({ id: 1 });

      const result = await service.create('uid', 10, {
        company_service_id: 5,
        notes: 'Urgente',
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        street: 'Rua A',
        number: '1',
        zip_code: '01001000',
      });

      expect(result.id).toBe(1);
      expect(prisma.service_requests.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: StatusServiceRequest.Pendente,
          }),
        }),
      );
    });

    it('lança ForbiddenException quando serviço não pertence à empresa', async () => {
      mockUser();
      prisma.companies.findUnique.mockResolvedValue({ id: 10 });
      prisma.company_services.findUnique.mockResolvedValue({
        id: 5,
        company_id: 99,
      });

      await expect(
        service.create('uid', 10, {
          company_service_id: 5,
          country: 'BR',
          state: 'SP',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua A',
          number: '1',
          zip_code: '01001000',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelByUser', () => {
    it('cancela solicitação pendente do próprio usuário', async () => {
      mockUser();
      prisma.service_requests.findUnique.mockResolvedValue({
        id: 1,
        user_id: 1,
        company_id: 10,
        status: StatusServiceRequest.Pendente,
      });
      prisma.service_requests.update.mockResolvedValue({
        id: 1,
        status: StatusServiceRequest.Cancelado,
      });

      const result = await service.cancelByUser('uid', 1);

      expect(result.status).toBe(StatusServiceRequest.Cancelado);
    });

    it('rejeita cancelamento de solicitação não pendente', async () => {
      mockUser();
      prisma.service_requests.findUnique.mockResolvedValue({
        id: 1,
        user_id: 1,
        company_id: 10,
        status: StatusServiceRequest.Agendado,
      });

      await expect(service.cancelByUser('uid', 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('acceptByCompany', () => {
    const acceptDto = {
      scheduled_date: new Date(Date.now() + 86400000).toISOString(),
      vehicle_id: 3,
      assigned_user_id: 4,
    };

    it('aceita solicitação pendente', async () => {
      mockAdminAccess();
      prisma.service_requests.findUnique.mockResolvedValue({
        id: 1,
        user_id: 1,
        company_id: 10,
        status: StatusServiceRequest.Pendente,
      });
      prisma.vehicles.findUnique.mockResolvedValue({ id: 3, company_id: 10 });
      prisma.service_requests.findFirst.mockResolvedValue(null);
      prisma.companies.findUnique.mockResolvedValue({ owner_user_id: 2 });
      prisma.users.findUnique.mockResolvedValue({ id: 4 });
      prisma.memberships.findUnique.mockResolvedValueOnce({
        user_id: 4,
        company_id: 10,
        role: Roles.Member,
      });
      prisma.service_requests.update.mockResolvedValue({
        id: 1,
        status: StatusServiceRequest.Agendado,
      });

      const result = await service.acceptByCompany('uid', 10, 1, acceptDto);

      expect(result.status).toBe(StatusServiceRequest.Agendado);
    });

    it('rejeita data agendada no passado', async () => {
      mockAdminAccess();
      prisma.service_requests.findUnique.mockResolvedValue({
        id: 1,
        user_id: 1,
        company_id: 10,
        status: StatusServiceRequest.Pendente,
      });

      await expect(
        service.acceptByCompany('uid', 10, 1, {
          ...acceptDto,
          scheduled_date: '2020-01-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('startRouteByDevice', () => {
    it('retorna solicitação já em rota', async () => {
      prisma.vehicles.findUnique.mockResolvedValue({ id: 1 });
      const inRoute = { id: 10, status: StatusServiceRequest.EmRota };
      prisma.service_requests.findFirst.mockResolvedValueOnce(inRoute);

      await expect(service.startRouteByDevice('device-1')).resolves.toEqual(
        inRoute,
      );
    });

    it('lança BadRequestException quando não há solicitação agendada', async () => {
      prisma.vehicles.findUnique.mockResolvedValue({ id: 1 });
      prisma.service_requests.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.startRouteByDevice('device-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('lança NotFoundException quando solicitação não existe', async () => {
      prisma.service_requests.findUnique.mockResolvedValue(null);

      await expect(service.findById('uid', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
